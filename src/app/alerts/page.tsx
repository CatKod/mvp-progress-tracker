"use client";

import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlertsPage() {
  const { hydrated, conflicts, tasks } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const byId = (id: string) => tasks.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={19}
        title="Cảnh báo trùng deadline"
        jp="締切重複アラート"
        description="Tự động phát hiện task trùng ngày nộp hoặc sát giờ nộp — những trường hợp gây quá tải."
      />

      {conflicts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Không có xung đột deadline nào.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {conflicts.map((c) => (
          <Card
            key={c.id}
            className={c.kind === "same_day" ? "border-red-200" : "border-amber-200"}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <CircleAlert
                  className={
                    c.kind === "same_day"
                      ? "mt-0.5 h-5 w-5 shrink-0 text-red-500"
                      : "mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{c.message}</p>
                    <Badge
                      variant="outline"
                      className={
                        c.kind === "same_day"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {c.kind === "same_day" ? "Trùng ngày" : "Sát giờ"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.taskIds.map((id) => {
                      const t = byId(id);
                      if (!t) return null;
                      return (
                        <Link
                          key={id}
                          href={`/tasks/detail`}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          {t.title} ・ {t.estimateHours}h
                        </Link>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Tổng khối lượng: {c.totalHours}h ・ Ngày nộp: {c.date}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
