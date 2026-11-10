import type {
  ConflictAlert,
  Member,
  PriorityScore,
  Task,
  TimeBlock,
  TrackerState,
  WorkloadRow,
} from "./types";
import { PEAK_MODE_HIDDEN_CATEGORIES } from "./types";

// -------------------------------------------------------------- time ------

export function startOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = CN
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addWeeks(iso: string, weeks: number): string {
  return addDays(iso, weeks * 7);
}

export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatDateVi(iso: string): string {
  if (!iso) return "—";
  const d = fromISODate(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  if (!iso) return "—";
  const d = fromISODate(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export const WEEKDAY_LABELS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function weekdayLabel(iso: string): string {
  const idx = (fromISODate(iso).getDay() + 6) % 7;
  return WEEKDAY_LABELS_VI[idx];
}

export function daysUntil(iso: string, from: Date = new Date()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const target = fromISODate(iso).getTime();
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  return Math.round((target - base.getTime()) / 86400000);
}

export function isOverdue(task: Task): boolean {
  if (!task.deadline || task.status === "done") return false;
  return daysUntil(task.deadline) < 0;
}

/** Hạn nộp riêng (nếu có) thay vì deadline chính thức khi tính cảnh báo. */
export function effectiveDeadline(task: Task): string {
  return task.personalDeadline || task.deadline;
}

// --------------------------------------------------------- workload -------

export function buildWorkload(tasks: Task[], members: Member[]): WorkloadRow[] {
  return members.map((member) => {
    const memberTasks = tasks.filter((t) => t.assignee === member.name);
    const estimateTotal = memberTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    const progress = memberTasks.length
      ? memberTasks.reduce((sum, t) => sum + statusWeight(t), 0) / memberTasks.length
      : 0;
    return {
      member,
      tasks: memberTasks,
      estimateTotal,
      capacityHours: member.capacityHours,
      utilization: member.capacityHours > 0 ? estimateTotal / member.capacityHours : 0,
      progress,
    };
  });
}

export function statusWeight(task: Task): number {
  switch (task.status) {
    case "done":
      return 1;
    case "in_progress":
    case "blocked":
      return 0.5;
    default:
      return 0;
  }
}

// ------------------------------------------------------ eisenhower --------

/** Xác định góc Eisenhower từ độ khó + mức ảnh hưởng + deadline gần. */
export function deriveQuadrant(
  task: Pick<Task, "difficulty" | "impact" | "deadline">,
): Task["quadrant"] {
  const important =
    task.impact === "high" ||
    task.impact === "medium" ||
    task.difficulty === "hard";
  const urgent = task.difficulty === "hard" || daysUntil(task.deadline) <= 2;
  if (important && urgent) return "important_urgent";
  if (important && !urgent) return "important_not_urgent";
  if (!important && urgent) return "not_important_urgent";
  return "not_important_not_urgent";
}

// ---------------------------------------------------------- priority ------

/**
 * Thuật toán gợi ý thứ tự ưu tiên (màn 9):
 *  - Deadline càng gần → điểm càng cao
 *  - Độ khó cao → nhiều giờ cần → nên làm sớm
 *  - Mức ảnh hưởng cao → ưu tiên
 */
export function computePriority(tasks: Task[]): PriorityScore[] {
  const scored = tasks
    .filter((t) => t.status !== "done")
    .map((task) => {
      const d = daysUntil(effectiveDeadline(task));
      const deadlineScore = d <= 0 ? 60 : d <= 2 ? 45 : d <= 7 ? 30 : d <= 14 ? 18 : 8;
      const difficultyScore = task.difficulty === "hard" ? 25 : task.difficulty === "medium" ? 15 : 8;
      const impactScore = task.impact === "high" ? 25 : task.impact === "medium" ? 15 : 8;
      const blockedPenalty = task.status === "blocked" ? -10 : 0;
      const score = deadlineScore + difficultyScore + impactScore + blockedPenalty;
      const reason =
        d <= 0
          ? "Trễ hạn — cần xử lý ngay"
          : d <= 2
            ? `Còn ${d} ngày, ảnh hưởng ${task.impact === "high" ? "cao" : "trung bình"}`
            : `Còn ${d} ngày, độ khó ${task.difficulty}`;
      return { task, score, reason };
    });
  return scored.sort((a, b) => b.score - a.score);
}

// --------------------------------------------------------- conflicts ------

/** Màn 19 — cảnh báo task trùng ngày nộp hoặc sát giờ. */
export function detectConflicts(tasks: Task[], closeDays = 2): ConflictAlert[] {
  const active = tasks.filter((t) => t.status !== "done" && t.deadline);
  const byDate = new Map<string, Task[]>();
  for (const task of active) {
    const date = task.deadline;
    byDate.set(date, [...(byDate.get(date) ?? []), task]);
  }

  const alerts: ConflictAlert[] = [];

  for (const [date, group] of byDate) {
    if (group.length > 1) {
      alerts.push({
        id: `same-${date}`,
        taskIds: group.map((t) => t.id),
        date,
        totalHours: group.reduce((s, t) => s + t.estimateHours, 0),
        kind: "same_day",
        message: `${group.length} task cùng nộp ngày ${formatDateVi(date)} — tổng ${group.reduce(
          (s, t) => s + t.estimateHours,
          0,
        )}h.`,
      });
    }
  }

  const sorted = [...active].sort((a, b) => a.deadline.localeCompare(b.deadline));
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a.deadline === b.deadline) continue;
    const gap = daysUntil(b.deadline, fromISODate(a.deadline));
    if (gap > 0 && gap <= closeDays) {
      alerts.push({
        id: `close-${a.id}-${b.id}`,
        taskIds: [a.id, b.id],
        date: b.deadline,
        totalHours: a.estimateHours + b.estimateHours,
        kind: "too_close",
        message: `"${a.title}" và "${b.title}" cách nhau ${gap} ngày (tổng ${a.estimateHours + b.estimateHours}h).`,
      });
    }
  }

  return alerts.sort((a, b) => a.date.localeCompare(b.date));
}

// ------------------------------------------------------- peak mode --------

/** Màn 22 — Chế độ Cao điểm ẩn/đẩy lùi task Câu lạc bộ & Sở thích. */
export function applyPeakMode(state: TrackerState): Task[] {
  if (!state.peakMode.enabled) return state.tasks;
  return state.tasks.filter((t) => !PEAK_MODE_HIDDEN_CATEGORIES.includes(t.category));
}

/** Các task bị ẩn bởi Chế độ Cao điểm (hiển thị ở chế độ tắt để khôi phục). */
export function hiddenByPeakMode(state: TrackerState): Task[] {
  if (!state.peakMode.enabled) return [];
  return state.tasks.filter((t) => PEAK_MODE_HIDDEN_CATEGORIES.includes(t.category));
}

// ------------------------------------------------------ time blocks -------

export function blocksForDate(blocks: TimeBlock[], date: string): TimeBlock[] {
  return blocks.filter((b) => b.date === date).sort((a, b) => a.startHour - b.startHour);
}

/** Tổng giờ đã time-block trong tuần. */
export function weeklyBlockedHours(blocks: TimeBlock[], weekStart: string): number {
  const days = new Set(weekDays(weekStart));
  return blocks.filter((b) => days.has(b.date)).reduce((s, b) => s + b.durationHours, 0);
}

/** Kiểm tra vượt ngân sách thời gian — màn 14. */
export function budgetStatus(
  state: TrackerState,
): { dayHours: number; weekHours: number; overDay: boolean; overWeek: boolean } {
  const week = new Set(weekDays(state.weekStart));
  const dayHours = state.tasks
    .filter((t) => t.deadline && week.has(t.deadline))
    .reduce((s, t) => s + t.estimateHours, 0);
  const weekHours = state.tasks.reduce((s, t) => s + t.estimateHours, 0);
  return {
    dayHours,
    weekHours,
    overDay: dayHours > state.timeBudget.maxHoursPerDay,
    overWeek: weekHours > state.timeBudget.maxHoursPerWeek,
  };
}

// ----------------------------------------------------- notifications ------

/** Màn 20 — sinh thông báo nhắc theo Personal Deadline. */
export function generateReminders(tasks: Task[], withinDays = 3): { taskId: string; title: string; body: string }[] {
  return tasks
    .filter((t) => t.status !== "done")
    .map((t) => ({ task: t, d: daysUntil(effectiveDeadline(t)) }))
    .filter(({ d }) => d <= withinDays)
    .sort((a, b) => a.d - b.d)
    .map(({ task, d }) => ({
      taskId: task.id,
      title: d < 0 ? "Task trễ hạn" : d === 0 ? "Task hết hạn hôm nay" : `Còn ${d} ngày`,
      body:
        d < 0
          ? `"${task.title}" đã trễ hạn ${Math.abs(d)} ngày.`
          : `"${task.title}" — hạn nộp ${formatDateVi(effectiveDeadline(task))}.`,
    }));
}

// ------------------------------------------------- extension template -----

export function buildExtensionTemplate(
  task: Task,
  requestedDays: number,
  template: "vi" | "en" | "ja",
): { subject: string; body: string } {
  const newDeadline = addDays(task.deadline, requestedDays);
  if (template === "en") {
    return {
      subject: `Extension request: ${task.title}`,
      body: `Dear [Teacher],\n\nI would like to request an extension of ${requestedDays} day(s) for the assignment "${task.title}".\nThe current deadline is ${task.deadline}, and I would like to submit it by ${newDeadline}.\n\nI apologize for the inconvenience and thank you for your understanding.\n\nBest regards,\n[Your name]`,
    };
  }
  if (template === "ja") {
    return {
      subject: `延長のお願い：${task.title}`,
      body: `[先生]\n\n課題「${task.title}」について、${requestedDays}日間の延長をお願いしたく存じます。\n現在の締切日は ${task.deadline} ですが、${newDeadline} まで提出させていただきたい存じます。\nご迷惑をおかけし申し訳ございませんが、何卒よろしくお願い申し上げます。\n\n敬具\n[お名前]`,
    };
  }
  return {
    subject: `Đề nghị gia hạn: ${task.title}`,
    body: `Kính gửi [Giảng viên],\n\nEm xin phép được gia hạn ${requestedDays} ngày cho nhiệm vụ "${task.title}".\nHạn nộp hiện tại là ${task.deadline}, em xin được nộp trước ngày ${newDeadline}.\n\nEm xin lỗi về sự bất tiện này và xin cảm ơn thầy/cô đã thấu hiểu.\n\nTrân trọng,\n[Ten của em]`,
  };
}
