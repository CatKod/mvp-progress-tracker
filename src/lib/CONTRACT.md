# Contract API — MVP Progress Tracker

**Đây là hợp đồng dữ liệu. KHÔNG sửa các file trong `src/lib/` và `src/components/` (trừ khi brief nói rõ).**
Logic nghiệp vụ đã viết sẵn và đã được test — chỉ cần gọi lại.

## 1. Trạng thái toàn cục

```tsx
"use client";
import { useTrackerApi } from "@/components/tracker-provider";

const tracker = useTrackerApi();
```

`TrackerProvider` đã bọc sẵn trong `src/app/layout.tsx` → mọi page chỉ cần gọi hook.

### State (đọc)

| Field | Kiểu | Mô tả |
|---|---|---|
| `profile` | `StudentProfile` | Hồ sơ sinh viên (màn 5) |
| `tasks` | `Task[]` | Toàn bộ task (kể cả đang bị ẩn bởi Peak Mode) |
| `visibleTasks` | `Task[]` | Task sau khi áp Chế độ Cao điểm — **dùng cái này để render danh sách** |
| `hiddenTasks` | `Task[]` | Task bị ẩn bởi Peak Mode (để cho user bật lại) |
| `members` | `Member[]` | Thành viên nhóm |
| `timeBudget` | `{ maxHoursPerDay: number; maxHoursPerWeek: number }` | Ngân sách thời gian (màn 14) |
| `quietHours` | `{ enabled: boolean; startHour: number; endHour: number }` | Khung giờ im lặng (màn 17) |
| `peakMode` | `{ enabled: boolean; pushedToWeekOf: string }` | Chế độ Cao điểm (màn 22) |
| `calendarEvents` | `CalendarEvent[]` | Sự kiện lịch (mô phỏng) |
| `notifications` | `AppNotification[]` | Thông báo (màn 20) |
| `meetingSlots` | `MeetingSlot[]` | Slot họp nhóm (màn 24) |
| `extensionRequests` | `ExtensionRequest[]` | Lịch sử xin gia hạn (màn 23) |
| `weekStart` | `string` | Ngày bắt đầu tuần đang xem (ISO `yyyy-mm-dd`, luôn là thứ 2) |
| `hydrated` | `boolean` | `false` lúc SSR/first render → render skeleton nếu `!hydrated` |

### Derived (đọc)

| Field | Kiểu | Mô tả |
|---|---|---|
| `workload` | `WorkloadRow[]` | Bảng khối lượng từng thành viên: `{ member, tasks, estimateTotal, capacityHours, utilization, progress }` |
| `priority` | `PriorityScore[]` | Task đã chấm điểm ưu tiên, đã sort giảm dần: `{ task, score, reason }` |
| `conflicts` | `ConflictAlert[]` | Cảnh báo trùng deadline: `{ id, taskIds, date, totalHours, kind, message }`, `kind` ∈ `"same_day" \| "too_close"` |
| `overall` | object | `{ totalTasks, estimateTotal, capacityTotal, progress, done, inProgress, blocked, notStarted, overdue, utilization, unreadNotifications }` |

### Actions (gọi)

```ts
upsertTask(draft: TaskDraft): void      // thêm mới nếu draft.id undefined, sửa nếu có draft.id
removeTask(id: string): void
setTaskStatus(id: string, status: ProgressStatus): void
setTaskQuadrant(id: string, quadrant: Quadrant): void
addTimeBlock(taskId: string, block: { date: string; startHour: number; durationHours: number }): void
removeTimeBlock(taskId: string, blockId: string): void

upsertMember(input: { id?: string; name: string; capacityHours: number }): void
removeMember(id: string): void

setWeekStart(weekStart: string): void
shiftWeek(delta: number): void          // +1 = tuần sau, -1 = tuần trước
setTimeBudget(budget: { maxHoursPerDay?: number; maxHoursPerWeek?: number }): void
setQuietHours(quiet: { enabled?: boolean; startHour?: number; endHour?: number }): void
setPeakMode(peak: { enabled?: boolean; pushedToWeekOf?: string }): void
setProfile(profile: Partial<StudentProfile>): void

refreshNotifications(): void
markNotificationRead(id: string): void
markAllNotificationsRead(): void
addExtensionRequest(input: { taskId: string; requestedDays: number; newDeadline: string; message: string; template: "vi" | "en" | "ja" }): void

resetToSample(): void
clearAll(): void
exportJson(): void
importJson(raw: string): string | null   // trả về null nếu OK, chuỗi lỗi nếu hỏng
```

## 2. Kiểu dữ liệu (import từ `@/lib/types`)

```ts
type ProgressStatus = "not_started" | "in_progress" | "blocked" | "done";
type Difficulty = "easy" | "medium" | "hard";
type Impact = "high" | "medium" | "low";
type Quadrant = "important_urgent" | "important_not_urgent" | "not_important_urgent" | "not_important_not_urgent";
type TaskCategory = "study" | "internship" | "work" | "club" | "personal";

interface Task {
  id: string;
  feature: string;        // 功能 — nhóm tính năng
  title: string;          // タスク
  subject: string;        // môn học / nhóm
  detail: string;         // 詳細
  deadline: string;       // 開発期限 (ISO yyyy-mm-dd)
  personalDeadline: string; // hạn nộp riêng (màn 15), sớm hơn deadline 1–2 ngày
  assignee: string;       // 担当者 — tên thành viên
  difficulty: Difficulty;
  impact: Impact;
  quadrant: Quadrant;
  estimateHours: number;  // 見積もり(h)
  status: ProgressStatus; // 進捗状況
  issues: string;         // 問題点・原因・対策
  memo: string;           // メモ
  category: TaskCategory;
  blocks: TimeBlock[];    // khung giờ đã time-block
  createdAt: string; updatedAt: string;
}

interface TimeBlock { id: string; date: string; startHour: number; durationHours: number; }

interface Member {
  id: string; name: string;
  capacityHours: number;  // 工数上限(h)
  freeSlots: TimeBlock[];
}

interface WorkloadRow {
  member: Member; tasks: Task[];
  estimateTotal: number; capacityHours: number;
  utilization: number;   // 稼働率 = estimateTotal / capacityHours
  progress: number;      // 0–1
}

interface ConflictAlert {
  id: string; taskIds: string[]; date: string;
  totalHours: number;
  kind: "same_day" | "too_close";
  message: string;
}

interface PriorityScore { task: Task; score: number; reason: string; }

interface AppNotification { id: string; title: string; body: string; at: string; read: boolean; taskId?: string; }
interface MeetingSlot { id: string; date: string; startHour: number; durationHours: number; availableMemberIds: string[]; votes: string[]; }
interface ExtensionRequest { id: string; taskId: string; requestedDays: number; newDeadline: string; message: string; template: "vi" | "en" | "ja"; createdAt: string; }
interface CalendarEvent { id: string; title: string; date: string; startHour: number; durationHours: number; kind: "class" | "work" | "club" | "other"; }
```

## 3. Hằng số & hàm tiện ích

Từ `@/lib/types`:

```ts
PROGRESS_STATUSES: { value: ProgressStatus; label: string; jp: string; badgeClass: string; weight: number }[]
DIFFICULTIES: { value: Difficulty; label: string; jp: string }[]
IMPACTS: { value: Impact; label: string; jp: string }[]
QUADRANTS: { value: Quadrant; title: string; jp: string; hint: string; columnClass: string }[]
TASK_CATEGORIES: { value: TaskCategory; label: string; jp: string }[]
STATUS_BY_VALUE: Record<ProgressStatus, { value; label; jp; badgeClass; weight }>
QUADRANT_BY_VALUE: Record<Quadrant, { value; title; jp; hint; columnClass }>
PEAK_MODE_HIDDEN_CATEGORIES: TaskCategory[]   // ["club", "personal"]
```

Từ `@/lib/domain`:

```ts
startOfWeek(date?: Date): string       // ISO thứ 2 của tuần chứa date
toISODate(d: Date): string
fromISODate(iso: string): Date
addDays(iso: string, days: number): string
addWeeks(iso: string, weeks: number): string
weekDays(weekStart: string): string[]   // 7 ngày, index 0 = thứ 2
formatDateVi(iso: string): string       // dd/mm/yyyy
formatDateShort(iso: string): string    // dd/mm
weekdayLabel(iso: string): string       // "T2".."CN"
WEEKDAY_LABELS_VI: string[]
daysUntil(iso: string, from?: Date): number
isOverdue(task: Task): boolean
effectiveDeadline(task: Task): string   // personalDeadline || deadline
buildWorkload(tasks: Task[], members: Member[]): WorkloadRow[]
statusWeight(task: Task): number
deriveQuadrant(task: Pick<Task,"difficulty"|"impact"|"deadline">): Quadrant
computePriority(tasks: Task[]): PriorityScore[]
detectConflicts(tasks: Task[], closeDays?: number): ConflictAlert[]
applyPeakMode(state: TrackerState): Task[]
hiddenByPeakMode(state: TrackerState): Task[]
blocksForDate(blocks: TimeBlock[], date: string): TimeBlock[]
weeklyBlockedHours(blocks: TimeBlock[], weekStart: string): number
budgetStatus(state: TrackerState): { dayHours; weekHours; overDay; overWeek }
generateReminders(tasks: Task[], withinDays?: number): { taskId; title; body }[]
buildExtensionTemplate(task: Task, requestedDays: number, template: "vi"|"en"|"ja"): { subject: string; body: string }
```

## 4. Component dùng chung (ĐÃ CÓ, không cần viết lại)

| Import | Từ | Dùng cho |
|---|---|---|
| `PageHeader` | `@/components/page-header` | Header màn hình: `<PageHeader screenNo={7} title="..." jp="..." description="..." actions={<>...</>} />` |
| `StatCard` | `@/components/stat-card` | Thẻ số liệu: `<StatCard label="..." value={...} hint="..." tone="good\|warn\|bad\|default" icon={<X className="h-4 w-4"/>} />` |
| `StatusBadge` | `@/components/status-badge` | `<StatusBadge status={task.status} />` |
| `TaskCard` | `@/components/task-card` | `<TaskCard task={task} href="/tasks/t1" showQuadrant />` hoặc `<TaskCard task={task} onOpen={(t)=>...} />` |
| `ComingSoon` | `@/components/coming-soon` | `<ComingSoon screenNo={11} title="..." jp="..." description="..." />` |

UI components (shadcn, đã cài): `button`, `card`, `badge`, `dialog`, `input`, `label`, `select`, `table`, `textarea`, `progress`, `tabs`, `separator`, `dropdown-menu`, `avatar`, `sheet`, `skeleton`, `tooltip`.
Dùng `cn` từ `@/lib/utils`.

## 5. Quy ước giao diện

- Tailwind v4, màu chủ đạo **emerald** (màn trung tâm trong sơ đồ = xanh lá).
- Tiếng Việt là ngôn ngữ chính; khi có mục Nhật, hiển thị kèm dạng `Tiếng Việt ・ 日本語` (giống sheet gốc).
- Font: Geist (đã cấu hình). Nền `bg-slate-50`, thẻ trắng `bg-white`, bo góc `rounded-lg`.
- Mọi thao tác ghi vào state đều tự lưu localStorage (không cần thêm code lưu).
- Dùng `<Select>` của shadcn với `value`/`onValueChange` (Radix, không dùng `defaultValue` cho form).
- Nếu `!hydrated` → render `<Skeleton className="h-40 w-full" />`.
- Không dùng emoji trong UI. Icon dùng `lucide-react`.
