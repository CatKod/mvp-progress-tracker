"use client";

import type { ReactNode } from "react";

/** Header dùng chung cho mọi màn hình. */
export function PageHeader({
  screenNo,
  title,
  jp,
  description,
  actions,
}: {
  screenNo: number;
  title: string;
  jp?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Màn hình #{screenNo}
          {jp ? ` ・ ${jp}` : ""}
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
