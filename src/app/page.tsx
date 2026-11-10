"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { StatusBadge } from "@/components/status-badge";
import { useTrackerApi } from "@/components/tracker-provider";
import {
  daysUntil,
  effectiveDeadline,
  formatDateShort,
  weekDays,
  weekdayLabel,
} from "@/lib/domain";

export default function HomePage() {
  const {
    hydrated,
    visibleTasks,
    overall,
    priority,
    conflicts,
    weekStart,
    shiftWeek,
    members,
    profile,
  } = useTrackerApi();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const days = weekDays(weekStart);
  const todayIso = new Date().toISOString().slice(0, 10);
  const topPriority = priority.slice(0, 3);
  const dueSoon = visibleTasks
    .filter((t) => t.status !== "done")
    .map((t) => ({ t, d: daysUntil(effectiveDeadline(t)) }))
    .filter(({ d }) => d <= 7)
    .sort((a, b) => a.d - b.d)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={6}
        title="Trang chủ — Dashboard tuần"
        jp="ダッシュボード"
        description={`Xin chào ${profile.fullName || "bạn"} — tổng quan công việc trong tuần, deadline sắp tới và top 3 nhiệm vụ quan trọng nhất.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(-1)}>
              Tuần trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => shiftWeek(1)}>
              Tuần sau
            </Button>
            <Link
              href="/tasks/new"
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
            >
              <ListTodo className="h-3.5 w-3.5" />
              Thêm task
            </Link>
          </>
        }
      />

      {/* Tuần đang xem */}
      <div className="flex flex-wrap gap-1.5">
        {days.map((d) => (
          <div
            key={d}
            className={`flex min-w-16 flex-col items-center rounded-lg border px-2.5 py-1.5 ${
              d === todayIso
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <span className="text-[11px] font-medium text-slate-500">{weekdayLabel(d)}</span>
            <span className="text-sm font-semibold tabular-nums text-slate-800">
              {formatDateShort(d)}
            </span>
          </div>
        ))}
      </div>

      {/* Số liệu tổng quan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tiến độ MVP"
          value={`${Math.round(overall.progress * 100)}%`}
          hint={`${overall.done}/${overall.totalTasks} task hoàn thành`}
          tone={overall.progress >= 0.7 ? "good" : "default"}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Tổng ước tính"
          value={`${overall.estimateTotal}h`}
          hint={`${Math.round(overall.utilization * 100)}% công suất (${members.length} thành viên)`}
          tone={overall.utilization > 1 ? "bad" : "default"}
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard
          label="Task trễ hạn"
          value={overall.overdue}
          hint={overall.overdue ? "Cần xử lý ngay" : "Không có task trễ hạn"}
          tone={overall.overdue > 0 ? "bad" : "good"}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <StatCard
          label="Cảnh báo trùng deadline"
          value={conflicts.length}
          hint={`${overall.blocked} task đang bị chặn`}
          tone={conflicts.length > 0 ? "warn" : "good"}
          icon={<CalendarDays className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top 3 ưu tiên */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-emerald-600" />
              Top 3 nhiệm vụ quan trọng nhất hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPriority.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có task nào đang hoạt động.</p>
            )}
            {topPriority.map((p, idx) => (
              <div key={p.task.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
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
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {p.reason} ・ Điểm ưu tiên {p.score}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deadline sắp tới */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Deadline sắp tới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {dueSoon.length === 0 && (
              <p className="text-sm text-slate-500">Không có deadline trong 7 ngày tới.</p>
            )}
            {dueSoon.map(({ t, d }) => (
              <div key={t.id} className="flex items-center justify-between gap-2">
                <Link
                  href={`/tasks/detail`}
                  className="min-w-0 flex-1 truncate text-sm text-slate-700 hover:text-emerald-700"
                >
                  {t.title}
                </Link>
                <Badge
                  variant="outline"
                  className={
                    d < 0
                      ? "border-red-200 bg-red-50 text-red-700"
                      : d <= 2
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                  }
                >
                  {d < 0 ? `Trễ ${Math.abs(d)}n` : `${d} ngày`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ngân sách thời gian tuần */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Ngân sách thời gian
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Ước tính trong tuần</span>
              <span className="tabular-nums">
                {overall.estimateTotal}h / {overall.capacityTotal}h
              </span>
            </div>
            <Progress
              value={Math.min(100, Math.round(overall.utilization * 100))}
              className="h-2"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Tiến độ tổng thể</span>
              <span className="tabular-nums">{Math.round(overall.progress * 100)}%</span>
            </div>
            <Progress value={Math.round(overall.progress * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Task khác */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Tất cả task</h2>
          <Link
            href="/board"
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
          >
            Xem Task Board
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTasks.slice(0, 6).map((t) => (
            <TaskCard key={t.id} task={t} href={`/tasks/detail`} showQuadrant />
          ))}
        </div>
      </div>
    </div>
  );
}
