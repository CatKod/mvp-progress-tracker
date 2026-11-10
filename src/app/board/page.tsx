"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { QUADRANTS } from "@/lib/types";
import type { Task } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardPage() {
  const { hydrated, visibleTasks, setTaskQuadrant } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={7}
        title="Task Board"
        jp="Eisenhower マトリクス"
        description="Phân loại công việc theo ma trận Eisenhower. Bấm vào một ô để xem chi tiết task bên trong."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUADRANTS.map((q) => {
          const items = visibleTasks.filter((t) => t.quadrant === q.value);
          return (
            <div
              key={q.value}
              className={`flex min-h-64 flex-col rounded-xl border-2 p-3 ${q.columnClass}`}
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-slate-800">{q.title}</p>
                <p className="text-xs text-slate-500">
                  {q.jp} ・ {q.hint}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-400">
                    Chưa có task
                  </p>
                )}
                {items.map((t: Task) => (
                  <TaskCard key={t.id} task={t} href={`/tasks/detail`} />
                ))}
              </div>
              <Link
                href="/tasks/new"
                className="mt-2 inline-flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-1.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700"
              >
                <LayoutGrid className="h-3 w-3" />
                Thêm task
              </Link>
            </div>
          );
        })}
      </div>

      {/* Chuyển góc nhanh */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          Chuyển nhanh góc Eisenhower
        </p>
        <div className="flex flex-wrap gap-2">
          {visibleTasks.slice(0, 8).map((t) => (
            <div key={t.id} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1">
              <span className="max-w-40 truncate text-xs text-slate-700">{t.title}</span>
              <select
                className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px]"
                value={t.quadrant}
                onChange={(e) => setTaskQuadrant(t.id, e.target.value as Task["quadrant"])}
              >
                {QUADRANTS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
