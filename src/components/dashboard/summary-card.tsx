import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import type { LucideProps } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface SummaryCardProps {
  label: string;
  value?: number;
  loading?: boolean;
  icon: ComponentType<LucideProps>;
  to?: string;
}

export function SummaryCard({ label, value, loading, icon: Icon, to }: SummaryCardProps) {
  const card = (
    <Card className="flex items-start justify-between gap-3 p-5 transition-shadow hover:shadow-md">
      <div>
        <p className="text-sm text-muted">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-14" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value ?? "—"}</p>
        )}
      </div>
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface text-steel">
        <Icon size={17} />
      </div>
    </Card>
  );
  return to ? (
    <Link to={to} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
