import { CircleCheck, CircleMinus, CircleX, Clock, TrendingUp, TriangleAlert, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusKind = "won" | "lost" | "pending" | "void" | "value" | "risk";

// Icon + word always travel with the hue: state is never carried by color alone.
// The 14% tint is the pair checked by scripts/verify-contrast.ts.
const STATUS: Record<StatusKind, { label: string; icon: LucideIcon; className: string }> = {
  won: { label: "Ganada", icon: CircleCheck, className: "bg-won/14 text-won" },
  lost: { label: "Perdida", icon: CircleX, className: "bg-lost/14 text-lost" },
  pending: { label: "Pendiente", icon: Clock, className: "bg-pending/14 text-pending" },
  void: { label: "Nula", icon: CircleMinus, className: "bg-void/14 text-void" },
  value: { label: "Value", icon: TrendingUp, className: "bg-value/14 text-value" },
  risk: { label: "Riesgo", icon: TriangleAlert, className: "bg-risk/14 text-risk" },
};

export function StatusBadge({
  kind,
  children,
  className,
}: {
  kind: StatusKind;
  /** Overrides the default word, e.g. "Value +6,2 %". */
  children?: React.ReactNode;
  className?: string;
}) {
  const { label, icon: Icon, className: tone } = STATUS[kind];
  return (
    <Badge className={cn("h-6 gap-1.5 px-2.5 text-[0.8125rem]", tone, className)}>
      <Icon aria-hidden="true" />
      {children ?? label}
    </Badge>
  );
}
