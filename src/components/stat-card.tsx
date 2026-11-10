"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Thẻ số liệu dùng chung (Trang chủ, Workload, Capacity...). */
export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
  icon?: ReactNode;
}) {
  const toneClass = {
    default: "text-slate-900",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-red-600",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className={cn("mt-0.5 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
