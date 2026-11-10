"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { DIFFICULTIES, IMPACTS } from "@/lib/types";

export default function PriorityPage() {
  const { hydrated, priority } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const max = priority.length ? priority[0].score : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={9}
        title="Đánh giá & Ưu tiên"
        jp="評価・優先順位"
        description="Thuật toán gợi ý thứ tự ưu tiên dựa trên deadline, độ khó (Dễ/Vừa/Khó) và mức độ ảnh hưởng (Cao/Trung bình/Thấp)."
      />

      <Card>
        <CardContent className="pt-4">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium text-slate-700">
              Thứ tự ưu tiên đề xuất ({priority.length} task)
            </p>
          </div>
          <div className="space-y-3">
            {priority.length === 0 && (
              <p className="text-sm text-slate-500">Không có task đang hoạt động.</p>
            )}
            {priority.map((p, idx) => (
              <div key={p.task.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/tasks/detail`}
                      className="truncate text-sm font-medium text-slate-800 hover:text-emerald-700"
                    >
                      {p.task.title}
                    </Link>
                    <StatusBadge status={p.task.status} />
                    <Badge variant="outline" className="font-normal">
                      Độ khó:{" "}
                      {DIFFICULTIES.find((d) => d.value === p.task.difficulty)?.label}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      Ảnh hưởng:{" "}
                      {IMPACTS.find((i) => i.value === p.task.impact)?.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{p.reason}</p>
                  <Progress value={Math.round((p.score / max) * 100)} className="mt-1.5 h-1.5" />
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
