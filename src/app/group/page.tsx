"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GroupPage() {
  const { hydrated, workload, members, upsertMember, removeMember } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const totalHours = workload.reduce((s, w) => s + w.estimateTotal, 0);
  const totalCapacity = workload.reduce((s, w) => s + w.capacityHours, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={10}
        title="Nhóm học tập"
        jp="学習グループ"
        description="Thành viên nhóm, khối lượng công việc và giờ rản (工数上限) của từng người."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Thành viên" value={members.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Tổng ước tính" value={`${totalHours}h`} />
        <StatCard
          label="Tổng giờ rản"
          value={`${totalCapacity}h`}
          hint={`${Math.round((totalCapacity ? totalHours / totalCapacity : 0) * 100)}% đã phân bổ`}
          tone={totalCapacity && totalHours > totalCapacity ? "bad" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thành viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Input
                defaultValue={m.name}
                className="h-8 w-48"
                onBlur={(e) => {
                  if (e.target.value !== m.name && e.target.value.trim())
                    upsertMember({ id: m.id, name: e.target.value.trim(), capacityHours: m.capacityHours });
                }}
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">工数上限</span>
                <Input
                  type="number"
                  defaultValue={m.capacityHours}
                  className="h-8 w-20"
                  onBlur={(e) =>
                    upsertMember({
                      id: m.id,
                      name: m.name,
                      capacityHours: Number(e.target.value) || 0,
                    })
                  }
                />
                <span className="text-xs text-slate-500">h</span>
              </div>
              <Badge variant="secondary" className="font-normal">
                {workload.find((w) => w.member.id === m.id)?.tasks.length ?? 0} task
              </Badge>
              <Button variant="ghost" size="xs" onClick={() => removeMember(m.id)}>
                Xóa
              </Button>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2">
            <Input id="new-member-name" placeholder="Tên thành viên mới" className="h-8 w-48" />
            <Input
              id="new-member-hours"
              type="number"
              placeholder="20"
              defaultValue={20}
              className="h-8 w-20"
            />
            <Button
              size="sm"
              onClick={() => {
                const name = (document.getElementById("new-member-name") as HTMLInputElement)?.value?.trim();
                const hours = Number((document.getElementById("new-member-hours") as HTMLInputElement)?.value) || 0;
                if (name) upsertMember({ name, capacityHours: hours });
                const nameEl = document.getElementById("new-member-name") as HTMLInputElement | null;
                if (nameEl) nameEl.value = "";
              }}
            >
              Thêm thành viên
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bảng khối lượng nhóm (工数管理表)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>担当 / Người phụ trách</TableHead>
                <TableHead>工数上限(h)</TableHead>
                <TableHead>見積もり計</TableHead>
                <TableHead>稼働率</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Task</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workload.map((w) => (
                <TableRow key={w.member.id}>
                  <TableCell className="font-medium">{w.member.name}</TableCell>
                  <TableCell className="tabular-nums">{w.capacityHours}h</TableCell>
                  <TableCell className="tabular-nums">{w.estimateTotal}h</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        w.utilization > 1
                          ? "border-red-200 bg-red-50 text-red-700"
                          : w.utilization > 0.85
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }
                    >
                      {Math.round(w.utilization * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32">
                    <Progress value={Math.round(w.progress * 100)} className="h-1.5" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {w.tasks.slice(0, 3).map((t) => (
                        <Link
                          key={t.id}
                          href={`/tasks/${t.id}`}
                          className="max-w-32 truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200"
                        >
                          {t.title}
                        </Link>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
