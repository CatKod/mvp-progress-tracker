"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useTrackerApi } from "@/components/tracker-provider";
import { TaskCard } from "@/components/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateVi, weekDays, weekdayLabel } from "@/lib/domain";

export default function MyTasksPage() {
  const { hydrated, visibleTasks, members, weekStart, timeBudget, setTimeBudget } = useTrackerApi();
  const [selected, setSelected] = useState<string>(members[0]?.name ?? "");

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const current = selected || members[0]?.name || "";
  const mine = visibleTasks.filter((t) => t.assignee === current);
  const done = mine.filter((t) => t.status === "done").length;
  const hours = mine.reduce((s, t) => s + t.estimateHours, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={21}
        title="Task của tôi / Lịch nhóm"
        jp="自分のタスク"
        description="Danh sách việc được giao và lịch họp nhóm."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Task của tôi" value={mine.length} />
        <StatCard label="Đã hoàn thành" value={done} tone="good" />
        <StatCard
          label="Tổng giờ"
          value={`${hours}h`}
          hint={`Ngân sách tuần ${timeBudget.maxHoursPerWeek}h`}
          tone={hours > timeBudget.maxHoursPerWeek ? "bad" : "default"}
        />
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">Task của tôi</TabsTrigger>
          <TabsTrigger value="meeting">Lịch nhóm</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant={current === m.name ? "default" : "outline"}
                onClick={() => setSelected(m.name)}
              >
                {m.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mine.length === 0 && (
              <p className="text-sm text-slate-500">Chưa có task nào được giao.</p>
            )}
            {mine.map((t) => (
              <TaskCard key={t.id} task={t} href={`/tasks/${t.id}`} showQuadrant />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meeting" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lịch họp nhóm trong tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weekDays(weekStart).map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <span className="w-16 text-xs font-medium text-slate-500">
                      {weekdayLabel(d)}
                    </span>
                    <span className="text-sm text-slate-700">{formatDateVi(d)}</span>
                    <span className="flex-1" />
                    <Badge variant="secondary" className="font-normal">
                      <Clock3 className="mr-1 h-3 w-3" />
                      19:00 ・ 2h
                    </Badge>
                  </div>
                ))}
              </div>
              <Link
                href="/group"
                className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
              >
                Đi tới Nhóm học tập →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ngân sách thời gian của tôi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>Giờ tối đa / ngày</span>
              <span className="tabular-nums">{timeBudget.maxHoursPerDay}h</span>
            </div>
            <Progress
              value={Math.min(100, Math.round((hours / 7 / Math.max(1, timeBudget.maxHoursPerDay)) * 100))}
              className="h-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-24"
              value={timeBudget.maxHoursPerDay}
              onChange={(e) => setTimeBudget({ maxHoursPerDay: Number(e.target.value) || 0 })}
            />
            <span className="text-xs text-slate-500">h/ngày</span>
            <Input
              type="number"
              className="w-24"
              value={timeBudget.maxHoursPerWeek}
              onChange={(e) => setTimeBudget({ maxHoursPerWeek: Number(e.target.value) || 0 })}
            />
            <span className="text-xs text-slate-500">h/tuần</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
