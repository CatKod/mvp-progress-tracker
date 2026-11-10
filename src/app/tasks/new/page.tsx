"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTIES, IMPACTS, PROGRESS_STATUSES, QUADRANTS, TASK_CATEGORIES } from "@/lib/types";
import type { Difficulty, Impact, ProgressStatus, Quadrant, TaskCategory } from "@/lib/types";
import { addDays, deriveQuadrant, fromISODate, toISODate } from "@/lib/domain";

function Form() {
  const searchParams = useSearchParams();
  const { hydrated, tasks, members, upsertTask } = useTrackerApi();
  const editId = searchParams.get("edit");

  const [feature, setFeature] = useState("Tính năng tạo & quản lý Task");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [detail, setDetail] = useState("");
  const [deadline, setDeadline] = useState(toISODate(new Date()));
  const [personalDeadline, setPersonalDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [impact, setImpact] = useState<Impact>("medium");
  const [quadrant, setQuadrant] = useState<Quadrant>("important_not_urgent");
  const [estimateHours, setEstimateHours] = useState("8");
  const [status, setStatus] = useState<ProgressStatus>("not_started");
  const [issues, setIssues] = useState("");
  const [memo, setMemo] = useState("");
  const [category, setCategory] = useState<TaskCategory>("study");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hydrated || !editId) return;
    const t = tasks.find((x) => x.id === editId);
    if (!t) return;
    setFeature(t.feature);
    setTitle(t.title);
    setSubject(t.subject);
    setDetail(t.detail);
    setDeadline(t.deadline);
    setPersonalDeadline(t.personalDeadline);
    setAssignee(t.assignee);
    setDifficulty(t.difficulty);
    setImpact(t.impact);
    setQuadrant(t.quadrant);
    setEstimateHours(String(t.estimateHours));
    setStatus(t.status);
    setIssues(t.issues);
    setMemo(t.memo);
    setCategory(t.category);
  }, [hydrated, editId, tasks]);

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const handleSubmit = () => {
    if (!title.trim()) return;
    upsertTask({
      id: editId ?? undefined,
      feature,
      title: title.trim(),
      subject,
      detail,
      deadline,
      personalDeadline,
      assignee,
      difficulty,
      impact,
      quadrant,
      estimateHours: Number(estimateHours) || 0,
      status,
      issues,
      memo,
      category,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (!editId) {
      setTitle("");
      setDetail("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={18}
        title={editId ? "Sửa Task" : "Thêm / Sửa / Xóa Task"}
        jp="タスク追加・編集"
        description="Chọn mức ưu tiên, đặt hạn nộp riêng. Hạn nộp riêng luôn sớm hơn deadline chính thức 1–2 ngày."
        actions={
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {editId ? "Lưu thay đổi" : "Thêm task"}
          </Button>
        }
      />

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Đã lưu vào bộ nhớ cục bộ.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="feature">機能 / Tính năng</Label>
              <Input id="feature" value={feature} onChange={(e) => setFeature(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">タスク / Tên nhiệm vụ *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Viết báo cáo phân tích dữ liệu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Môn học / Nhóm</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail">詳細 / Mô tả</Label>
              <Textarea id="detail" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assignee">担当者 / Người phụ trách</Label>
              <Select
                value={assignee || "none"}
                onValueChange={(v) => setAssignee(v === "none" ? "" : (v ?? ""))}
              >
                <SelectTrigger id="assignee" className="w-full">
                  <SelectValue placeholder="Chưa gán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa gán</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hạn & Ưu tiên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">開発期限 / Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setQuadrant(
                      deriveQuadrant({ difficulty, impact, deadline: e.target.value }),
                    );
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pd">Personal Deadline</Label>
                <Input
                  id="pd"
                  type="date"
                  value={personalDeadline}
                  onChange={(e) => setPersonalDeadline(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => setPersonalDeadline(addDays(deadline, -2))}
                >
                  Đặt = deadline − 2 ngày
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Độ khó</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => {
                    const d = v as Difficulty;
                    setDifficulty(d);
                    setQuadrant(deriveQuadrant({ difficulty: d, impact, deadline }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label} ({d.jp})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Mức ảnh hưởng</Label>
                <Select
                  value={impact}
                  onValueChange={(v) => {
                    const i = v as Impact;
                    setImpact(i);
                    setQuadrant(deriveQuadrant({ difficulty, impact: i, deadline }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACTS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label} ({i.jp})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Góc Eisenhower</Label>
              <Select value={quadrant} onValueChange={(v) => setQuadrant(v as Quadrant)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUADRANTS.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hours">見積もり(h)</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  value={estimateHours}
                  onChange={(e) => setEstimateHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tiến độ</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProgressStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRESS_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Phân loại</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label} ({c.jp})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">問題点・原因・対策 / メモ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="issues">Vấn đề / Nguyên nhân / Đối tác</Label>
              <Textarea id="issues" rows={3} value={issues} onChange={(e) => setIssues(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="memo">メモ / Ghi chú</Label>
              <Textarea id="memo" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TaskFormPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Form />
    </Suspense>
  );
}
