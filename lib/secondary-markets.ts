/**
 * Pre-match heuristic model for secondary markets (corners, cards, team totals),
 * built from TeamProfile advanced metrics + TimesFM trends + friction engine.
 * // ponytail: heuristic, upgrade to a trained model when labelled data exists
 */
import type { TeamProfileSnapshot } from "./team-profile-shared";
import type { TimesfmForecastSnapshot } from "./timesfm-forecast";
import {
  CORNER_PRIOR_TOTAL,
  CORNER_HOME_SHARE,
  CARDS_PRIOR_TOTAL,
  poissonOverProb,
  poissonUnderProb,
} from "./phase2-markets";
import type { MarketType } from "./types";
import {
  computeXCard,
  computeCardProbabilities,
  resolveRivalryMultiplier,
} from "./friction-engine";

export type SecondaryMarketsInput = {
  homeProfile: TeamProfileSnapshot | null;
  awayProfile: TeamProfileSnapshot | null;
  homeTimesfm?: TimesfmForecastSnapshot | null;
  awayTimesfm?: TimesfmForecastSnapshot | null;
  refereeStrictness?: number;
  rivalryMultiplier?: number;
  fixture?: {
    leagueId?: number;
    isDerby?: boolean;
    roundLabel?: string | null;
    homeCountry?: string | null;
    awayCountry?: string | null;
  };
};

const SECONDARY_MARKETS: MarketType[] = [
  "corners_over_8_5",
  "corners_under_8_5",
  "corners_over_9_5",
  "corners_under_9_5",
  "corners_over_10_5",
  "corners_under_10_5",
  "corners_home_over_3_5",
  "corners_away_over_3_5",
  "cards_over_3_5",
  "cards_under_3_5",
  "cards_over_4_5",
  "cards_under_4_5",
  "cards_btts",
  "home_over_1_5",
  "away_over_1_5",
];

function clampProb(p: number): number {
  return Math.min(0.99, Math.max(0.01, p));
}

export {
  resolveRefereeStrictness,
  resolveRefereeStrictnessAsync,
} from "./referee-engine";

function hasAdvancedMetrics(
  home: TeamProfileSnapshot | null,
  away: TeamProfileSnapshot | null
): boolean {
  const profiles = [home, away].filter(Boolean) as TeamProfileSnapshot[];
  return profiles.some(
    (p) =>
      (p.avgNpxGScored != null && Number.isFinite(p.avgNpxGScored)) ||
      (p.avgCornersFor != null && Number.isFinite(p.avgCornersFor))
  );
}

type FeatureVector = Record<string, number>;

function buildFeatures(input: SecondaryMarketsInput): FeatureVector {
  const home = input.homeProfile;
  const away = input.awayProfile;
  const homeTf = input.homeTimesfm;
  const awayTf = input.awayTimesfm;
  const homeNpxg = home?.avgNpxGScored ?? 1.2;
  const awayNpxg = away?.avgNpxGScored ?? 1.2;
  const awayNpxgConc = away?.avgNpxGConceded ?? 1.2;
  const homePpda = home?.avgPPDA ?? 11;
  const awayPpda = away?.avgPPDA ?? 11;
  const homeCorners =
    home?.avgCornersFor ?? CORNER_PRIOR_TOTAL * CORNER_HOME_SHARE;
  const awayCorners =
    away?.avgCornersFor ?? CORNER_PRIOR_TOTAL * (1 - CORNER_HOME_SHARE);
  const homeCornersAgainst = home?.avgCornersAgainst ?? homeCorners;
  const awayCornersAgainst = away?.avgCornersAgainst ?? awayCorners;
  const cornersHome = (homeCorners + awayCornersAgainst) / 2;
  const cornersAway = (awayCorners + homeCornersAgainst) / 2;
  const cornersTotal = cornersHome + cornersAway;
  const cardsHome = home?.avgCardsFor ?? CARDS_PRIOR_TOTAL * 0.5;
  const cardsAway = away?.avgCardsFor ?? CARDS_PRIOR_TOTAL * 0.5;
  const cardsTotal = cardsHome + cardsAway;
  const npxgDiff = homeNpxg - awayNpxgConc;
  const pressing = (homePpda + awayPpda) / 2;
  const derbyBoost = input.fixture?.isDerby ? 0.15 : 0;

  // Rivalry multiplier from friction-engine (CONMEBOL KO + ARG-BRA boost)
  const rivalryMult =
    input.rivalryMultiplier ??
    resolveRivalryMultiplier({
      leagueId: input.fixture?.leagueId,
      roundLabel: input.fixture?.roundLabel,
      homeCountry: input.fixture?.homeCountry,
      awayCountry: input.fixture?.awayCountry,
    });

  const hCornerTf = homeTf?.timesfmCornersFor;
  const aCornerTf = awayTf?.timesfmCornersFor;
  const hCornerAgTf = homeTf?.timesfmCornersAgainst;
  const aCornerAgTf = awayTf?.timesfmCornersAgainst;
  const hasCornerTf =
    hCornerTf != null &&
    aCornerTf != null &&
    hCornerAgTf != null &&
    aCornerAgTf != null &&
    Number.isFinite(hCornerTf) &&
    Number.isFinite(aCornerTf) &&
    Number.isFinite(hCornerAgTf) &&
    Number.isFinite(aCornerAgTf);
  const timesfmCornerTrendDiff = hasCornerTf
    ? hCornerTf! + aCornerAgTf! - (aCornerTf! + hCornerAgTf!)
    : 0;

  const hCardTf = homeTf?.timesfmCardsFor;
  const aCardTf = awayTf?.timesfmCardsFor;
  const hasCardTf =
    hCardTf != null &&
    aCardTf != null &&
    Number.isFinite(hCardTf) &&
    Number.isFinite(aCardTf);
  const timesfmCardIntensityIndex = hasCardTf
    ? (hCardTf! + aCardTf!) / Math.max(0.5, CARDS_PRIOR_TOTAL)
    : 1;

  return {
    npxg_diff: npxgDiff,
    pressing,
    corners_total: cornersTotal,
    corners_home: cornersHome,
    corners_away: cornersAway,
    cards_total: cardsTotal,
    cards_home: cardsHome,
    cards_away: cardsAway,
    home_npxg: homeNpxg,
    away_npxg: awayNpxg,
    derby_boost: derbyBoost,
    rivalry_mult: rivalryMult,
    timesfm_corner_trend_diff: timesfmCornerTrendDiff,
    timesfm_card_intensity_index: timesfmCardIntensityIndex,
  };
}

function heuristicProbs(
  features: FeatureVector,
  refereeStrictness: number,
  input: SecondaryMarketsInput
): Partial<Record<MarketType, number>> {
  const cornerTrend = features.timesfm_corner_trend_diff ?? 0;
  const cornersTotal = Math.max(5, features.corners_total + cornerTrend * 0.15);
  const cornersHome = Math.max(2, features.corners_home + Math.max(0, cornerTrend) * 0.08);
  const cornersAway = Math.max(2, features.corners_away + Math.max(0, -cornerTrend) * 0.08);

  const rivalryMult = features.rivalry_mult ?? 1;
  const cardIntensity = features.timesfm_card_intensity_index ?? 1;

  // Use friction-engine for card lambdas (includes rivalry + press + TimesFM blend)
  const xCard = computeXCard({
    homeAvgCardsFor: features.cards_home * cardIntensity,
    awayAvgCardsFor: features.cards_away * cardIntensity,
    homeAvgPPDA: input.homeProfile?.avgPPDA,
    awayAvgPPDA: input.awayProfile?.avgPPDA,
    homeTimesfmCardsFor: input.homeTimesfm?.timesfmCardsFor,
    awayTimesfmCardsFor: input.awayTimesfm?.timesfmCardsFor,
    refereeStrictness,
    leagueId: input.fixture?.leagueId,
    roundLabel: input.fixture?.roundLabel,
    homeCountry: input.fixture?.homeCountry,
    awayCountry: input.fixture?.awayCountry,
  });
  // Apply rivalry multiplier on top (features already carry it from buildFeatures)
  const xCardHome = xCard.xCardHome * rivalryMult;
  const xCardAway = xCard.xCardAway * rivalryMult;
  const xCardTotal = xCardHome + xCardAway;
  const cardProbs = computeCardProbabilities(xCardHome, xCardAway);

  // Legacy derby_boost fallback for total cards (kept for backwards compat)
  const legacyTotal = Math.max(1.5, features.cards_total * refereeStrictness + features.derby_boost);
  const cardsTotal = xCardTotal > 1.5 ? xCardTotal : legacyTotal;

  const npxgHomeLambda = Math.max(0.4, 1.1 + features.npxg_diff * 0.35);
  const npxgAwayLambda = Math.max(0.4, 1.1 - features.npxg_diff * 0.3);

  return {
    corners_over_8_5: poissonOverProb(cornersTotal, 8.5),
    corners_under_8_5: poissonUnderProb(cornersTotal, 8.5),
    corners_over_9_5: poissonOverProb(cornersTotal, 9.5),
    corners_under_9_5: poissonUnderProb(cornersTotal, 9.5),
    corners_over_10_5: poissonOverProb(cornersTotal, 10.5),
    corners_under_10_5: poissonUnderProb(cornersTotal, 10.5),
    corners_home_over_3_5: poissonOverProb(cornersHome, 3.5),
    corners_away_over_3_5: poissonOverProb(cornersAway, 3.5),
    cards_over_3_5: poissonOverProb(cardsTotal, 3.5),
    cards_under_3_5: poissonUnderProb(cardsTotal, 3.5),
    cards_over_4_5: poissonOverProb(cardsTotal, 4.5),
    cards_under_4_5: poissonUnderProb(cardsTotal, 4.5),
    cards_btts: cardProbs.cards_btts,
    home_over_1_5: poissonOverProb(npxgHomeLambda, 1.5),
    away_over_1_5: poissonOverProb(npxgAwayLambda, 1.5),
  };
}

/** Run secondary-market inference; empty when profiles lack advanced metrics. */
export function predictSecondaryMarkets(
  input: SecondaryMarketsInput
): Partial<Record<MarketType, number>> {
  if (!hasAdvancedMetrics(input.homeProfile, input.awayProfile)) return {};

  const features = buildFeatures(input);
  const refereeStrictness = input.refereeStrictness ?? 1;
  const heuristic = heuristicProbs(features, refereeStrictness, input);
  const out: Partial<Record<MarketType, number>> = {};

  for (const market of SECONDARY_MARKETS) {
    out[market] = clampProb(heuristic[market] ?? 0.5);
  }

  return out;
}

/** Expose feature builder for verify scripts. */
export function buildSecondaryFeaturesForVerify(
  input: SecondaryMarketsInput
): Record<string, number> {
  return buildFeatures(input);
}
