/**
 * Domain model — Quản lý Thời gian & Task cho Sinh viên.
 *
 * Bám theo sơ đồ chuyển màn hình `screen-flow.drawio`:
 *   - Màn 6  Trang chủ (Dashboard tuần)
 *   - Màn 7  Task Board (Ma trận Eisenhower)
 *   - Màn 8  Lịch tuần — Time-blocking
 *   - Màn 9  Đánh giá & Ưu tiên
 *   - Màn 10 Nhóm học tập
 *   - Màn 13 Chi tiết Task
 *   - Màn 14 Ngân sách thời gian
 *   - Màn 15 Personal Deadline
 *   - Màn 16 Bảng khối lượng nhóm
 *   - Màn 18 Thêm / Sửa / Xóa Task
 *   - Màn 19 Cảnh báo trùng deadline
 *   - Màn 20 Trung tâm Thông báo
 *   - Màn 21 Task của tôi / Lịch nhóm
 *   - Màn 22 Chế độ Cao điểm
 *   - Màn 23 Gia hạn deadline
 *   - Màn 24 Bình chọn lịch họp nhóm
 *   - Màn 17 Khung giờ im lặng
 */

// ---------------------------------------------------------------- enums ----

export type ProgressStatus = "not_started" | "in_progress" | "blocked" | "done";

export const PROGRESS_STATUSES: {
  value: ProgressStatus;
  label: string;
  jp: string;
  badgeClass: string;
  /** Hệ số tiến độ khi tính % hoàn thành. */
  weight: number;
}[] = [
  {
    value: "not_started",
    label: "Chưa bắt đầu",
    jp: "未着手",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    weight: 0,
  },
  {
    value: "in_progress",
    label: "Đang thực hiện",
    jp: "進行中",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    weight: 0.5,
  },
  {
    value: "blocked",
    label: "Bị chặn",
    jp: "ブロック",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    weight: 0.5,
  },
  {
    value: "done",
    label: "Hoàn thành",
    jp: "完了",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    weight: 1,
  },
];

export const STATUS_BY_VALUE: Record<ProgressStatus, (typeof PROGRESS_STATUSES)[number]> =
  Object.fromEntries(PROGRESS_STATUSES.map((s) => [s.value, s])) as never;

/** Độ khó — màn 9. */
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: { value: Difficulty; label: string; jp: string }[] = [
  { value: "easy", label: "Dễ", jp: "簡単" },
  { value: "medium", label: "Vừa", jp: "普通" },
  { value: "hard", label: "Khó", jp: "難しい" },
];

/** Mức độ ảnh hưởng — màn 9. */
export type Impact = "high" | "medium" | "low";

export const IMPACTS: { value: Impact; label: string; jp: string }[] = [
  { value: "high", label: "Cao", jp: "高" },
  { value: "medium", label: "Trung bình", jp: "中" },
  { value: "low", label: "Thấp", jp: "低" },
];

/** Góc ma trận Eisenhower — màn 7. */
export type Quadrant = "important_urgent" | "important_not_urgent" | "not_important_urgent" | "not_important_not_urgent";

export const QUADRANTS: {
  value: Quadrant;
  title: string;
  jp: string;
  hint: string;
  columnClass: string;
}[] = [
  {
    value: "important_urgent",
    title: "Quan trọng & Khẩn cấp",
    jp: "重要・緊急",
    hint: "Làm ngay",
    columnClass: "border-red-300 bg-red-50/40",
  },
  {
    value: "important_not_urgent",
    title: "Quan trọng & Không khẩn cấp",
    jp: "重要・緊急でない",
    hint: "Lên lịch để làm",
    columnClass: "border-blue-300 bg-blue-50/40",
  },
  {
    value: "not_important_urgent",
    title: "Không quan trọng & Khẩn cấp",
    jp: "重要でない・緊急",
    hint: "Ẩn / đẩy lùi",
    columnClass: "border-amber-300 bg-amber-50/40",
  },
  {
    value: "not_important_not_urgent",
    title: "Không quan trọng & Không khẩn cấp",
    jp: "重要でない・緊急でない",
    hint: "Bỏ qua",
    columnClass: "border-slate-300 bg-slate-50/40",
  },
];

export const QUADRANT_BY_VALUE = Object.fromEntries(QUADRANTS.map((q) => [q.value, q])) as Record<
  Quadrant,
  (typeof QUADRANTS)[number]
>;

/** Phân loại nguồn việc — dùng cho Chế độ Cao điểm (màn 22). */
export type TaskCategory = "study" | "internship" | "work" | "club" | "personal";

export const TASK_CATEGORIES: { value: TaskCategory; label: string; jp: string }[] = [
  { value: "study", label: "Học tập", jp: "学習" },
  { value: "internship", label: "Thực tập", jp: "実習" },
  { value: "work", label: "Làm thêm", jp: "アルバイト" },
  { value: "club", label: "Câu lạc bộ", jp: "サークル" },
  { value: "personal", label: "Sở thích", jp: "趣味" },
];

/** Loại việc bị ẩn khi bật Chế độ Cao điểm. */
export const PEAK_MODE_HIDDEN_CATEGORIES: TaskCategory[] = ["club", "personal"];

// ---------------------------------------------------------------- models ----

export interface Task {
  id: string;
  /** 功能 — Tính năng (nhóm chức năng của MVP). */
  feature: string;
  /** タスク — Tên nhiệm vụ. */
  title: string;
  /** Môn học / nhóm — hiển thị ở màn 13. */
  subject: string;
  /** 詳細 — Mô tả chi tiết. */
  detail: string;
  /** 開発期限 — Hạn chính thức (ISO yyyy-mm-dd). */
  deadline: string;
  /** Hạn nộp riêng (màn 15), luôn sớm hơn deadline chính thức 1–2 ngày. */
  personalDeadline: string;
  /** 担当者 — Người phụ trách (tên thành viên nhóm). */
  assignee: string;
  /** Độ khó (màn 9). */
  difficulty: Difficulty;
  /** Mức độ ảnh hưởng (màn 9). */
  impact: Impact;
  /** Góc Eisenhower (màn 7). */
  quadrant: Quadrant;
  /** 見積もり(h) — Ước tính giờ. */
  estimateHours: number;
  /** 進捗状況 — Tình trạng. */
  status: ProgressStatus;
  /** 問題点・原因・対策 — Vấn đề / Nguyên nhân / Đối tác. */
  issues: string;
  /** メモ — Ghi chú. */
  memo: string;
  category: TaskCategory;
  /** Khung giờ đã time-block trong tuần (màn 8). */
  blocks: TimeBlock[];
  createdAt: string;
  updatedAt: string;
}

/** Khung giờ trong lịch tuần — màn 8. */
export interface TimeBlock {
  id: string;
  /** ISO date của ngày (yyyy-mm-dd). */
  date: string;
  /** Giờ bắt đầu, số giờ 0–23. */
  startHour: number;
  /** Số giờ kéo dài. */
  durationHours: number;
}

/** 表1：工数管理表 — Thành viên + giờ rản (工数上限). */
export interface Member {
  id: string;
  name: string;
  /** 工数上限(h) — giờ có thể phân bổ trong kỳ. */
  capacityHours: number;
  /** Khung giờ rảnh (màn 5 / màn 21). */
  freeSlots: TimeBlock[];
}

/** Ngân sách thời gian — màn 14. */
export interface TimeBudget {
  /** Giờ tối đa học/làm trong một ngày. */
  maxHoursPerDay: number;
  /** Giờ tối đa trong một tuần. */
  maxHoursPerWeek: number;
}

/** Khung giờ im lặng — màn 17. */
export interface QuietHours {
  enabled: boolean;
  /** Giờ bắt đầu (0–23). */
  startHour: number;
  /** Giờ kết thúc (0–23). */
  endHour: number;
}

/** Chế độ Cao điểm — màn 22. */
export interface PeakMode {
  enabled: boolean;
  /** Tuần bắt đầu từ (ISO date) mà các task bị đẩy lùi. */
  pushedToWeekOf: string;
}

/** Hồ sơ sinh viên — màn 5. */
export interface StudentProfile {
  fullName: string;
  /** Ngành học. */
  faculty: string;
  /** Năm học (1–5). */
  year: number;
  /** Giới tính. */
  gender: "male" | "female" | "other" | "unspecified";
  /** MSSV. */
  studentId: string;
  /** Đã bật/tắt onboarding. */
  onboarded: boolean;
}

/** Lịch sự kiện từ Google Calendar — màn 4 / màn 8 (dữ liệu mô phỏng). */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startHour: number;
  durationHours: number;
  kind: "class" | "work" | "club" | "other";
}

/** Thông báo — màn 20. */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  /** ISO datetime. */
  at: string;
  read: boolean;
  taskId?: string;
}

/** Đề xuất lịch họp nhóm — màn 24. */
export interface MeetingSlot {
  id: string;
  date: string;
  startHour: number;
  durationHours: number;
  /** Thành viên bật được slot này. */
  availableMemberIds: string[];
  /** Số phiếu đồng ý đã gửi. */
  votes: string[];
}

/** Lịch sử gia hạn — màn 23. */
export interface ExtensionRequest {
  id: string;
  taskId: string;
  requestedDays: number;
  newDeadline: string;
  message: string;
  template: "vi" | "en" | "ja";
  createdAt: string;
}

export interface TrackerState {
  profile: StudentProfile;
  tasks: Task[];
  members: Member[];
  timeBudget: TimeBudget;
  quietHours: QuietHours;
  peakMode: PeakMode;
  calendarEvents: CalendarEvent[];
  notifications: AppNotification[];
  meetingSlots: MeetingSlot[];
  extensionRequests: ExtensionRequest[];
  /** Ngày bắt đầu của tuần đang xem (ISO yyyy-mm-dd, luôn là thứ 2). */
  weekStart: string;
}

// ----------------------------------------------------------- derived ------

export interface WorkloadRow {
  member: Member;
  tasks: Task[];
  estimateTotal: number;
  capacityHours: number;
  /** 稼働率 — tổng ước tính / giờ rản. */
  utilization: number;
  /** Tiến độ trung bình của các task của thành viên (0–1). */
  progress: number;
}

export interface ConflictAlert {
  id: string;
  taskIds: string[];
  date: string;
  /** Tổng giờ ước tính của các task trùng nhau. */
  totalHours: number;
  kind: "same_day" | "too_close";
  message: string;
}

export interface PriorityScore {
  task: Task;
  score: number;
  /** Giải thích ngắn vì sao task này được ưu tiên. */
  reason: string;
}
