"use client";

import { Mail } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { buildExtensionTemplate, addDays, formatDateVi } from "@/lib/domain";

export default function OpportunityPage() {
  const { hydrated, visibleTasks, addExtensionRequest } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  const task = visibleTasks[0];

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={23}
        title="Gia hạn deadline"
        jp="締切延長"
        description="Tạo template email / tin nhắn xin gia hạn gửi giảng viên."
      />

      {task ? (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-emerald-600" />
              Xin gia hạn: {task.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="days">Số ngày xin gia hạn</Label>
                <Input id="days" type="number" defaultValue={2} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label>Deadline hiện tại</Label>
                <Input readOnly value={formatDateVi(task.deadline)} />
              </div>
            </div>

            <Tabs defaultValue="vi">
              <TabsList>
                <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ja">日本語</TabsTrigger>
              </TabsList>
              {(["vi", "en", "ja"] as const).map((lang) => {
                const tpl = buildExtensionTemplate(task, 2, lang);
                return (
                  <TabsContent key={lang} value={lang} className="mt-3 space-y-2">
                    <div className="space-y-1.5">
                      <Label>Tiêu đề</Label>
                      <Input readOnly value={tpl.subject} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nội dung</Label>
                      <Textarea readOnly rows={8} value={tpl.body} />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${tpl.subject}\n\n${tpl.body}`);
                        addExtensionRequest({
                          taskId: task.id,
                          requestedDays: 2,
                          newDeadline: addDays(task.deadline, 2),
                          message: tpl.body,
                          template: lang,
                        });
                      }}
                    >
                      Sao chép & ghi nhận
                    </Button>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Chưa có task nào.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
