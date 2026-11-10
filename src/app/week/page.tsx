"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  blocksForDate,
  formatDateShort,
  weekDays,
  weekdayLabel,
  weeklyBlockedHours,
} from "@/lib/domain";
import type { Task } from "@/lib/types";

const START_HOUR = 7;
const END_HOUR = 23;

export default function WeekPage() {
  const { hydrated, visibleTasks, calendarEvents, weekStart, shiftWeek, addTimeBlock } =
    useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const days = weekDays(weekStart);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const scheduled = visibleTasks.filter((t) => t.blocks.length > 0);
  const blockedHours = weeklyBlockedHours(
    visibleTasks.flatMap((t) => t.blocks),
    weekStart,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={8}
        title="Lịch tuần — Time-blocking"
        jp="週間スケジュール"
        description="Bảng 7 ngày. Kéo thả task vào khung giờ để ấn định thời gian làm việc."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(-1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(1)}>
              Sau
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Đã time-block"
          value={`${blockedHours}h`}
          hint={`${scheduled.length} task đã xếp lịch`}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <StatCard
          label="Sự kiện lịch"
          value={calendarEvents.length}
          hint="Lấy từ Google Calendar (mô phỏng)"
        />
        <StatCard
          label="Task chưa xếp lịch"
          value={visibleTasks.length - scheduled.length}
          hint="Cần gán khung giờ"
          tone={visibleTasks.length - scheduled.length > 0 ? "warn" : "good"}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-14 border-r border-slate-200 px-2 py-2 text-xs font-medium text-slate-500">
                Giờ
              </th>
              {days.map((d) => (
                <th
                  key={d}
                  className="border-r border-slate-200 px-2 py-2 text-xs font-medium text-slate-600 last:border-r-0"
                >
                  <span className="block">{weekdayLabel(d)}</span>
                  <span className="block text-[11px] font-normal text-slate-400">
                    {formatDateShort(d)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h} className="border-b border-slate-100 last:border-b-0">
                <td className="border-r border-slate-200 px-2 py-1 text-right text-[11px] tabular-nums text-slate-400">
                  {h}:00
                </td>
                {days.map((d) => {
                  const evs = calendarEvents.filter((e) => e.date === d && h >= e.startHour && h < e.startHour + e.durationHours);
                  const blocks = visibleTasks.flatMap((t) =>
                    blocksForDate(t.blocks, d)
                      .filter((b) => h >= b.startHour && h < b.startHour + b.durationHours)
                      .map((b) => ({ t, b })),
                  );
                  return (
                    <td key={d} className="h-9 border-r border-slate-100 px-1 py-0.5 align-top last:border-r-0">
                      <div className="flex flex-col gap-0.5">
                        {evs.map((e) => (
                          <div
                            key={e.id}
                            className="truncate rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700"
                          >
                            {e.title}
                          </div>
                        ))}
                        {blocks.map(({ t, b }) => (
                          <Link
                            key={b.id}
                            href={`/tasks/${t.id}`}
                            className="truncate rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800 hover:bg-emerald-200"
                          >
                            {t.title}
                          </Link>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gán nhanh khung giờ */}
      <Card>
        <CardContent className="pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            Gán khung giờ nhanh
          </p>
          <div className="space-y-2">
            {visibleTasks
              .filter((t) => t.status !== "done")
              .slice(0, 6)
              .map((t: Task) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="min-w-40 flex-1 truncate text-sm text-slate-700">{t.title}</span>
                  <select
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                    value={days[0]}
                    onChange={(e) =>
                      addTimeBlock(t.id, { date: e.target.value, startHour: 9, durationHours: 2 })
                    }
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {weekdayLabel(d)} {formatDateShort(d)}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      addTimeBlock(t.id, { date: days[0], startHour: 9, durationHours: 2 })
                    }
                  >
                    + 9:00 (2h)
                  </Button>
                  {t.blocks.length > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      {t.blocks.length} khung giờ
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
