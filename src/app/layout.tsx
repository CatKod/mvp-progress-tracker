import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TrackerProvider } from "@/components/tracker-provider";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MVP Progress Tracker — Quản lý Thời gian & Task cho Sinh viên",
  description:
    "Theo dõi MVP theo 工数管理表 / 進捗管理表: phân bổ giờ, tiến độ, ưu tiên và cảnh báo trùng deadline.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50">
        <TrackerProvider>
          <AppShell>{children}</AppShell>
        </TrackerProvider>
      </body>
    </html>
  );
}
