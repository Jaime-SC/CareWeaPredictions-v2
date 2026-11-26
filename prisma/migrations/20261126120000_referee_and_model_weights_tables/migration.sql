-- Tables previously created out-of-band (db push / one-off scripts).
-- Idempotent: safe on databases that already have them.

CREATE TABLE IF NOT EXISTS "ModelWeightsConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "weights" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelWeightsConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RefereeProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avgYellowCards" DOUBLE PRECISION NOT NULL,
    "avgRedCards" DOUBLE PRECISION NOT NULL,
    "avgFoulsPerMatch" DOUBLE PRECISION NOT NULL,
    "avgPenalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strictnessIndex" DOUBLE PRECISION NOT NULL,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefereeProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RefereeLeagueStat" (
    "id" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "avgYellowCards" DOUBLE PRECISION NOT NULL,
    "avgRedCards" DOUBLE PRECISION NOT NULL,
    "avgFoulsPerMatch" DOUBLE PRECISION NOT NULL,
    "avgPenalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchCount" INTEGER NOT NULL,
    "strictnessIndex" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefereeLeagueStat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CompetitionCardBaseline" (
    "leagueId" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "avgYellowCards" DOUBLE PRECISION NOT NULL,
    "avgRedCards" DOUBLE PRECISION NOT NULL,
    "avgFoulsPerMatch" DOUBLE PRECISION NOT NULL,
    "avgPenalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "matchCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionCardBaseline_pkey" PRIMARY KEY ("leagueId")
);

CREATE TABLE IF NOT EXISTS "RefereeMatchRecord" (
    "id" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "apiFixtureId" INTEGER NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "yellowCards" DOUBLE PRECISION NOT NULL,
    "redCards" DOUBLE PRECISION NOT NULL,
    "fouls" DOUBLE PRECISION NOT NULL,
    "penalties" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "RefereeMatchRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefereeProfile_name_key" ON "RefereeProfile"("name");

CREATE INDEX IF NOT EXISTS "RefereeLeagueStat_leagueId_idx" ON "RefereeLeagueStat"("leagueId");

CREATE INDEX IF NOT EXISTS "RefereeLeagueStat_region_idx" ON "RefereeLeagueStat"("region");

CREATE UNIQUE INDEX IF NOT EXISTS "RefereeLeagueStat_refereeId_leagueId_key" ON "RefereeLeagueStat"("refereeId", "leagueId");

CREATE INDEX IF NOT EXISTS "CompetitionCardBaseline_region_idx" ON "CompetitionCardBaseline"("region");

CREATE UNIQUE INDEX IF NOT EXISTS "RefereeMatchRecord_apiFixtureId_key" ON "RefereeMatchRecord"("apiFixtureId");

CREATE INDEX IF NOT EXISTS "RefereeMatchRecord_refereeId_matchDate_idx" ON "RefereeMatchRecord"("refereeId", "matchDate");

CREATE INDEX IF NOT EXISTS "RefereeMatchRecord_refereeId_leagueId_matchDate_idx" ON "RefereeMatchRecord"("refereeId", "leagueId", "matchDate");

ALTER TABLE "RefereeLeagueStat" DROP CONSTRAINT IF EXISTS "RefereeLeagueStat_refereeId_fkey";

ALTER TABLE "RefereeLeagueStat" ADD CONSTRAINT "RefereeLeagueStat_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "RefereeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RefereeMatchRecord" DROP CONSTRAINT IF EXISTS "RefereeMatchRecord_refereeId_fkey";

ALTER TABLE "RefereeMatchRecord" ADD CONSTRAINT "RefereeMatchRecord_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "RefereeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
