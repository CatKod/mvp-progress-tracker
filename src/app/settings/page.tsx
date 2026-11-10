"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const {
    hydrated,
    profile,
    setProfile,
    quietHours,
    setQuietHours,
    peakMode,
    setPeakMode,
    timeBudget,
    setTimeBudget,
    exportJson,
    importJson,
    resetToSample,
    clearAll,
  } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={12}
        title="Cài đặt"
        jp="設定"
        description="Thông báo, Quiet Hours, Chế độ Cao điểm và sao lưu dữ liệu."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hồ sơ sinh viên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                value={profile.fullName}
                onChange={(e) => setProfile({ fullName: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="faculty">Ngành</Label>
                <Input
                  id="faculty"
                  value={profile.faculty}
                  onChange={(e) => setProfile({ faculty: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Năm học</Label>
                <Input
                  id="year"
                  type="number"
                  min={1}
                  max={5}
                  value={profile.year}
                  onChange={(e) => setProfile({ year: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mssv">MSSV</Label>
              <Input
                id="mssv"
                value={profile.studentId}
                onChange={(e) => setProfile({ studentId: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="qd">Giờ tối đa / ngày (h)</Label>
              <Input
                id="qd"
                type="number"
                value={timeBudget.maxHoursPerDay}
                onChange={(e) => setTimeBudget({ maxHoursPerDay: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qw">Giờ tối đa / tuần (h)</Label>
              <Input
                id="qw"
                type="number"
                value={timeBudget.maxHoursPerWeek}
                onChange={(e) => setTimeBudget({ maxHoursPerWeek: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quiet">Quiet Hours (từ {quietHours.startHour}h)</Label>
              <input
                id="quiet"
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => setQuietHours({ enabled: e.target.checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="peak">Chế độ Cao điểm</Label>
              <input
                id="peak"
                type="checkbox"
                checked={peakMode.enabled}
                onChange={(e) => setPeakMode({ enabled: e.target.checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-emerald-600" />
              Dữ liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-500">
              Toàn bộ dữ liệu lưu trong localStorage của trình duyệt. Xuất/nhập file JSON để
              chuyển máy hoặc chia sẻ với nhóm.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportJson}>
                Xuất JSON
              </Button>
              <label className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted">
                Nhập JSON
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const err = importJson(await file.text());
                    if (err) alert(err);
                  }}
                />
              </label>
              <Button variant="outline" size="sm" onClick={resetToSample}>
                Khôi phục dữ liệu mẫu
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => {
                  if (confirm("Xóa toàn bộ dữ liệu?")) clearAll();
                }}
              >
                Xóa tất cả
              </Button>
            </div>
            <Badge variant="secondary" className="font-normal">
              Khoá: mvp-progress-tracker:v2
            </Badge>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        Nếu bạn vừa mở app lần đầu, hãy vào{" "}
        <Link href="/" className="text-emerald-700 hover:underline">
          Trang chủ
        </Link>{" "}
        để xem dữ liệu mẫu.
      </p>
    </div>
  );
}
