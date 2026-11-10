"use client";

import { Clock3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function QuietHoursPage() {
  const { hydrated, quietHours, setQuietHours } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={17}
        title="Khung giờ im lặng"
        jp="サイレント時間"
        description="Quiet Hours — không nhận thông báo trong khung giờ này để đảm bảo nghỉ ngơi."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="h-4 w-4 text-emerald-600" />
            Cài đặt Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="qh-enabled">Tạm tắt thông báo</Label>
            <Switch
              id="qh-enabled"
              checked={quietHours.enabled}
              onCheckedChange={(v) => setQuietHours({ enabled: v })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="qh-start">Từ giờ</Label>
              <Input
                id="qh-start"
                type="number"
                min={0}
                max={23}
                value={quietHours.startHour}
                onChange={(e) => setQuietHours({ startHour: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qh-end">Đến giờ</Label>
              <Input
                id="qh-end"
                type="number"
                min={0}
                max={23}
                value={quietHours.endHour}
                onChange={(e) => setQuietHours({ endHour: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Thông báo sẽ tạm tắt từ{" "}
            <strong>
              {quietHours.startHour}:00 đến {quietHours.endHour}:00
            </strong>
            . Trong thời gian này, thông báo vẫn được tạo nhưng không làm phiền.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
