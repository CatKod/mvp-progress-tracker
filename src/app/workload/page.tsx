"use client";

import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function WorkloadPage() {
  const { hydrated, workload, overall } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={16}
        title="Bảng khối lượng nhóm"
        jp="作業負荷ダッシュボード"
        description="Workload Dashboard từng thành viên — theo dõi 稼働率 (tổng ước tính / giờ rản)."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Thành viên" value={workload.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Tổng giờ rản" value={`${overall.capacityTotal}h`} />
        <StatCard
          label="Công suất chung"
          value={`${Math.round(overall.utilization * 100)}%`}
          tone={overall.utilization > 1 ? "bad" : overall.utilization > 0.85 ? "warn" : "good"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Ước tính / Giờ rản</TableHead>
                <TableHead>稼働率</TableHead>
                <TableHead>Tiến độ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workload.map((w) => (
                <TableRow key={w.member.id}>
                  <TableCell className="font-medium">{w.member.name}</TableCell>
                  <TableCell className="tabular-nums">{w.tasks.length}</TableCell>
                  <TableCell className="tabular-nums">
                    {w.estimateTotal}h / {w.capacityHours}h
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(100, Math.round(w.utilization * 100))}
                        className="h-1.5 w-24"
                      />
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
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {Math.round(w.progress * 100)}%
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
