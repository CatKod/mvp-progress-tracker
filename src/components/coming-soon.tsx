"use client";

import Link from "next/link";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  screenNo,
  title,
  jp,
  description,
}: {
  screenNo: number;
  title: string;
  jp?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Construction className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Màn hình #{screenNo}
              {jp ? ` ・ ${jp}` : ""}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-800">{title}</h2>
          </div>
          {description && (
            <p className="max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
          )}
          <Link
            href="/"
            className="inline-flex h-7 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Về Trang chủ
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
