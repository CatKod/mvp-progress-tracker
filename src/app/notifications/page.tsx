"use client";

import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const {
    hydrated,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
  } = useTrackerApi();

  if (!hydrated) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        screenNo={20}
        title="Trung tâm Thông báo"
        jp="通知センター"
        description="Push / Email nhắc việc theo hạn nộp riêng (Personal Deadline)."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refreshNotifications}>
              Làm mới
            </Button>
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
              Đánh dấu đã đọc tất cả
            </Button>
          </>
        }
      />

      {notifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            Chưa có thông báo nào.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className={n.read ? "opacity-60" : ""}>
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                {n.read ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  {!n.read && (
                    <Badge variant="destructive" className="font-normal">
                      Mới
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.at).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                {!n.read && (
                  <Button variant="ghost" size="xs" onClick={() => markNotificationRead(n.id)}>
                    Đã đọc
                  </Button>
                )}
                {n.taskId && (
                  <Link
                    href={`/tasks/detail`}
                    className="inline-flex h-6 items-center rounded-lg px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Xem task
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
