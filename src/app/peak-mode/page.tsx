"use client";

import { Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PEAK_MODE_HIDDEN_CATEGORIES, TASK_CATEGORIES } from "@/lib/types";
import { formatDateVi } from "@/lib/domain";

export default function PeakModePage() {
  const { hydrated, peakMode, setPeakMode, hiddenTasks, visibleTasks } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const hiddenLabels = TASK_CATEGORIES.filter((c) =>
    PEAK_MODE_HIDDEN_CATEGORIES.includes(c.value),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={22}
        title="Chế độ Cao điểm"
        jp="ピークモード"
        description="Khi đang quá tải, tự động ẩn / đẩy lùi các task Câu lạc bộ và Sở thích sang tuần sau."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" />
            Bật Chế độ Cao điểm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="peak">Ẩn task Câu lạc bộ / Sở thích</Label>
            <Switch
              id="peak"
              checked={peakMode.enabled}
              onCheckedChange={(v) => setPeakMode({ enabled: v })}
            />
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Khi bật, các nhóm sau sẽ bị ẩn:</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {hiddenLabels.map((c) => (
                <Badge key={c.value} variant="secondary" className="font-normal">
                  {c.label} ({c.jp})
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Task bị đẩy lùi tới tuần:{" "}
            <strong className="text-slate-800">{formatDateVi(peakMode.pushedToWeekOf)}</strong>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đang hiển thị ({visibleTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {visibleTasks.slice(0, 8).map((t) => (
              <div key={t.id} className="truncate rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700">
                {t.title}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đang bị ẩn ({hiddenTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {hiddenTasks.length === 0 && (
              <p className="text-sm text-slate-500">
                Chế độ đang tắt — không có task nào bị ẩn.
              </p>
            )}
            {hiddenTasks.map((t) => (
              <div
                key={t.id}
                className="truncate rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm text-amber-800"
              >
                {t.title}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
