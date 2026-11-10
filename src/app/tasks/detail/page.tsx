"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTIES, IMPACTS, PROGRESS_STATUSES, QUADRANT_BY_VALUE } from "@/lib/types";
import { daysUntil, effectiveDeadline, formatDateVi, isOverdue } from "@/lib/domain";

export default function TaskDetailPage() {
  const {
    hydrated,
    tasks,
    setTaskStatus,
    setTaskQuadrant,
    upsertTask,
    removeTask,
  } = useTrackerApi();
  const [selectedId, setSelectedId] = useState<string>("");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const task = tasks.find((t) => t.id === selectedId) ?? tasks[0];

  if (!task) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-slate-500">Chưa có task nào.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-emerald-700 hover:underline">
            Về Trang chủ
          </Link>
        </CardContent>
      </Card>
    );
  }

  const d = daysUntil(effectiveDeadline(task));
  const quadrant = QUADRANT_BY_VALUE[task.quadrant];

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại
      </Link>

      <PageHeader
        screenNo={13}
        title={task.title}
        jp="タスク詳細"
        description={task.detail}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => removeTask(task.id)}>
              Xóa task
            </Button>
            <Link
              href={`/tasks/new?edit=${task.id}`}
              className="inline-flex h-7 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
            >
              Sửa
            </Link>
          </>
        }
      />

      {/* Chọn task */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className={`max-w-56 truncate rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              t.id === task.id
                ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="機能 / Tính năng" value={task.feature} />
              <Field label="Môn học / Nhóm" value={task.subject || "—"} />
              <Field
                label="開発期限 / Hạn chính thức"
                value={
                  <span className={isOverdue(task) ? "font-medium text-red-600" : ""}>
                    {formatDateVi(task.deadline)}
                  </span>
                }
                hint={d >= 0 ? `Còn ${d} ngày` : `Trễ ${Math.abs(d)} ngày`}
              />
              <Field
                label="Hạn nộp riêng (Personal Deadline)"
                value={task.personalDeadline ? formatDateVi(task.personalDeadline) : "Chưa đặt"}
              />
              <Field label="担当者 / Người phụ trách" value={task.assignee || "—"} />
              <Field label="見積もり(h)" value={`${task.estimateHours}h`} />
              <Field
                label="Độ khó"
                value={DIFFICULTIES.find((x) => x.value === task.difficulty)?.label ?? "—"}
              />
              <Field
                label="Mức ảnh hưởng"
                value={IMPACTS.find((x) => x.value === task.impact)?.label ?? "—"}
              />
              <Field label="Góc Eisenhower" value={quadrant.title} hint={quadrant.jp} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">問題点・原因・対策</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                key={`issues-${task.id}`}
                defaultValue={task.issues}
                placeholder="Vấn đề / Nguyên nhân / Đối tác…"
                rows={3}
                onBlur={(e) => upsertTask({ ...task, issues: e.target.value })}
              />
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">メモ</p>
              <Textarea
                key={`memo-${task.id}`}
                defaultValue={task.memo}
                placeholder="Ghi chú…"
                rows={2}
                onBlur={(e) => upsertTask({ ...task, memo: e.target.value })}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">進捗状況 / Tình trạng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PROGRESS_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setTaskStatus(task.id, s.value)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                    task.status === s.value
                      ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{s.label}</span>
                  <span className="text-xs text-slate-400">{s.jp}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Góc Eisenhower</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(QUADRANT_BY_VALUE).map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setTaskQuadrant(task.id, q.value)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    task.quadrant === q.value
                      ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{q.title}</span>
                  <span className="text-xs text-slate-400">{q.jp}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Khung giờ đã xếp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {task.blocks.length === 0 && (
                <p className="text-sm text-slate-500">Chưa xếp khung giờ nào.</p>
              )}
              {task.blocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <Clock3 className="h-3 w-3 text-slate-400" />
                  {formatDateVi(b.date)} ・ {b.startHour}:00 +{b.durationHours}h
                </div>
              ))}
              <Link
                href="/week"
                className="inline-block text-xs text-emerald-700 hover:underline"
              >
                Xếp lịch trong Lịch tuần →
              </Link>
            </CardContent>
          </Card>

          {task.issues && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex gap-2 pt-4 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {task.issues}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
