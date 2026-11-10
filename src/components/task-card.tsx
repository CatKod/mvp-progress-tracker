"use client";

import Link from "next/link";
import { Clock3, TriangleAlert, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { QUADRANT_BY_VALUE } from "@/lib/types";
import type { Task } from "@/lib/types";
import { daysUntil, effectiveDeadline, formatDateShort, isOverdue } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** Thẻ task dùng chung cho Board, Trang chủ, My Tasks. */
export function TaskCard({
  task,
  href,
  onOpen,
  showQuadrant = false,
}: {
  task: Task;
  href?: string;
  onOpen?: (task: Task) => void;
  showQuadrant?: boolean;
}) {
  const overdue = isOverdue(task);
  const d = daysUntil(effectiveDeadline(task));
  const quadrant = QUADRANT_BY_VALUE[task.quadrant];

  const body = (
    <CardContent className="p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-800">{task.title}</p>
        <StatusBadge status={task.status} className="shrink-0" />
      </div>

      {task.subject && (
        <p className="mt-1 truncate text-xs text-slate-500">{task.subject}</p>
      )}

      {showQuadrant && (
        <Badge variant="secondary" className="mt-2 font-normal">
          {quadrant.title}
        </Badge>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className={cn("inline-flex items-center gap-1", overdue && "font-medium text-red-600")}>
          <Clock3 className="h-3 w-3" />
          {overdue ? "Trễ " : "Hạn "}
          {formatDateShort(effectiveDeadline(task))}
          {d >= 0 && d <= 7 && !overdue ? ` (${d} ngày)` : ""}
        </span>
        {task.assignee && (
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignee}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <TriangleAlert className="h-3 w-3" />
          {task.estimateHours}h
        </span>
      </div>

      {task.issues && (
        <p className="mt-2 line-clamp-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
          {task.issues}
        </p>
      )}
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className="transition-shadow hover:shadow-md">{body}</Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn("cursor-pointer transition-shadow hover:shadow-md", onOpen && "cursor-pointer")}
      onClick={() => onOpen?.(task)}
    >
      {body}
    </Card>
  );
}
