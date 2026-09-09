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
    <Card className="group flex items-start justify-between gap-3 p-5 transition-transform hover:-translate-y-0.5">
      <div>
        <p className="text-sm font-medium text-steel">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-14" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value ?? "—"}</p>
        )}
      </div>
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-accent-soft text-brand-accent transition-transform group-hover:scale-105">
        <Icon size={20} />
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
