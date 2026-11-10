"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CircleAlert,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  LogOut,
  Mail,
  Settings,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrackerApi } from "@/components/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Danh sách màn hình — bám theo sơ đồ chuyển màn `screen-flow.drawio`.
 * `implemented: false` → màn chưa xây, hiển thị trang "Sắp xây".
 */
export const SCREENS: {
  href: string;
  label: string;
  jp: string;
  screenNo: number;
  icon: React.ComponentType<{ className?: string }>;
  implemented: boolean;
}[] = [
  { href: "/", label: "Trang chủ", jp: "ダッシュボード", screenNo: 6, icon: LayoutDashboard, implemented: true },
  { href: "/board", label: "Task Board", jp: " Eisenhower", screenNo: 7, icon: LayoutGrid, implemented: true },
  { href: "/week", label: "Lịch tuần", jp: "タイムブロッキング", screenNo: 8, icon: CalendarDays, implemented: true },
  { href: "/priority", label: "Đánh giá & Ưu tiên", jp: "優先順位", screenNo: 9, icon: ListChecks, implemented: true },
  { href: "/group", label: "Nhóm học tập", jp: "学習グループ", screenNo: 10, icon: Users, implemented: true },
  { href: "/opportunity", label: "Cơ hội & Hỗ trợ", jp: "機会・支援", screenNo: 11, icon: Wallet, implemented: false },
  { href: "/settings", label: "Cài đặt", jp: "設定", screenNo: 12, icon: Settings, implemented: true },
];

export const SUB_SCREENS: {
  href: string;
  label: string;
  screenNo: number;
  icon: React.ComponentType<{ className?: string }>;
  implemented: boolean;
}[] = [
  { href: "/tasks/new", label: "Thêm / Sửa Task", screenNo: 18, icon: ListChecks, implemented: true },
  { href: "/alerts", label: "Cảnh báo trùng deadline", screenNo: 19, icon: CircleAlert, implemented: true },
  { href: "/notifications", label: "Trung tâm Thông báo", screenNo: 20, icon: Bell, implemented: true },
  { href: "/my-tasks", label: "Task của tôi / Lịch nhóm", screenNo: 21, icon: GraduationCap, implemented: true },
  { href: "/capacity", label: "Ngân sách thời gian", screenNo: 14, icon: Clock, implemented: true },
  { href: "/workload", label: "Bảng khối lượng nhóm", screenNo: 16, icon: Users, implemented: true },
  { href: "/extend", label: "Gia hạn deadline", screenNo: 23, icon: Mail, implemented: true },
  { href: "/quiet-hours", label: "Khung giờ im lặng", screenNo: 17, icon: Clock, implemented: true },
  { href: "/peak-mode", label: "Chế độ Cao điểm", screenNo: 22, icon: Zap, implemented: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { overall, profile } = useTrackerApi();
  const unreadNotifications = overall.unreadNotifications;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Quản lý Thời gian</p>
            <p className="truncate text-xs text-slate-500">{profile.faculty || "Sinh viên"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Màn hình chính
            </p>
            <ul className="space-y-0.5">
              {SCREENS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      isActive(s.href)
                        ? "bg-emerald-50 font-medium text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{s.label}</span>
                    {!s.implemented && (
                      <span className="shrink-0 text-[10px] text-slate-400">#</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Màn hình con
            </p>
            <ul className="space-y-0.5">
              {SUB_SCREENS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      isActive(s.href)
                        ? "bg-emerald-50 font-medium text-emerald-700"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700">{profile.fullName || "Người dùng"}</p>
          <p>MSSV: {profile.studentId || "—"}</p>
          <Button
            variant="ghost"
            size="xs"
            className="mt-2 gap-1.5 text-xs text-slate-500"
            onClick={() => window.localStorage.removeItem("mvp-progress-tracker:v2")}
          >
            <LogOut className="h-3 w-3" />
            Xóa dữ liệu cục bộ
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm font-medium text-slate-700">{SCREENS.find((s) => isActive(s.href))?.label ?? "MVP Tracker"}</span>
          </div>
          {overall.overdue > 0 && (
            <Badge variant="destructive" className="gap-1">
              <CircleAlert className="h-3 w-3" />
              {overall.overdue} trễ hạn
            </Badge>
          )}
          <Link
            href="/notifications"
            className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Thông báo"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
