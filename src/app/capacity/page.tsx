"use client";

import { Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function CapacityPage() {
  const { hydrated, timeBudget, setTimeBudget, overall } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const overWeek = overall.estimateTotal > timeBudget.maxHoursPerWeek;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={14}
        title="Ngân sách thời gian"
        jp="時間予算"
        description="Giờ tối đa học/làm mỗi ngày và mỗi tuần — giới hạn để tránh quá tải."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-emerald-600" />
              Giới hạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="perday">Giờ tối đa mỗi ngày (h)</Label>
              <Input
                id="perday"
                type="number"
                min={0}
                value={timeBudget.maxHoursPerDay}
                onChange={(e) => setTimeBudget({ maxHoursPerDay: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="perweek">Giờ tối đa mỗi tuần (h)</Label>
              <Input
                id="perweek"
                type="number"
                min={0}
                value={timeBudget.maxHoursPerWeek}
                onChange={(e) => setTimeBudget({ maxHoursPerWeek: Number(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hiện trạng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Tổng ước tính trong tuần" value={`${overall.estimateTotal}h`} />
            <Row label="Tổng giờ rản của nhóm" value={`${overall.capacityTotal}h`} />
            <Row
              label="Vượt ngân sách tuần?"
              value={overWeek ? "Có — cần giảm tải" : "Không"}
              tone={overWeek ? "bad" : "good"}
            />
            <Row
              label="Trung bình mỗi ngày"
              value={`${Math.round(overall.estimateTotal / 7)}h`}
            />
            <Row
              label="Trung bình mỗi người"
              value={`${Math.round(overall.estimateTotal / Math.max(1, overall.totalTasks))}h / task`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          tone === "bad"
            ? "font-medium text-red-600"
            : tone === "good"
              ? "font-medium text-emerald-600"
              : "font-medium text-slate-800"
        }
      >
        {value}
      </span>
    </div>
  );
}
