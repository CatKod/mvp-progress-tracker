"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_BY_VALUE } from "@/lib/types";
import type { ProgressStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ProgressStatus;
  className?: string;
}) {
  const meta = STATUS_BY_VALUE[status];
  return (
    <Badge variant="outline" className={cn("font-normal", meta.badgeClass, className)}>
      {meta.label}
      <span className="ml-1 text-[10px] opacity-70">{meta.jp}</span>
    </Badge>
  );
}
