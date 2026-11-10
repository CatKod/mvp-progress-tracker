import {
  addDays,
  applyPeakMode,
  buildWorkload,
  computePriority,
  detectConflicts,
  generateReminders,
  startOfWeek,
  toISODate,
  weekDays,
} from "./domain";
import type {
  AppNotification,
  CalendarEvent,
  Difficulty,
  Impact,
  Member,
  ProgressStatus,
  Quadrant,
  Task,
  TaskCategory,
  TimeBlock,
  TrackerState,
} from "./types";

// --------------------------------------------------------- sample data ----

const now = () => new Date().toISOString();
const today = () => toISODate(new Date());

function mkTask(t: Partial<Task> & Pick<Task, "id" | "title" | "feature">): Task {
  return {
    subject: "",
    detail: "",
    deadline: addDays(today(), 7),
    personalDeadline: "",
    assignee: "",
    difficulty: "medium",
    impact: "medium",
    quadrant: "important_not_urgent",
    estimateHours: 8,
    status: "not_started",
    issues: "",
    memo: "",
    category: "study",
    blocks: [],
    createdAt: now(),
    updatedAt: now(),
    ...t,
  };
}

export const SAMPLE_MEMBERS: Member[] = [
  { id: "m1", name: "Trưởng nhóm", capacityHours: 20, freeSlots: [] },
  { id: "m2", name: "Thành viên A", capacityHours: 20, freeSlots: [] },
  { id: "m3", name: "Thành viên B", capacityHours: 16, freeSlots: [] },
];

export const SAMPLE_TASKS: Task[] = [
  mkTask({
    id: "t1",
    feature: "Tính năng tạo & quản lý Task",
    title: "CRUD Task (Thêm / Sửa / Xóa)",
    subject: "CSDL",
    detail: "Màn hình nhập task: tiêu đề, deadline, độ khó, mức ảnh hưởng, hạn nộp riêng.",
    deadline: addDays(today(), 10),
    assignee: "Trưởng nhóm",
    difficulty: "medium",
    impact: "high",
    quadrant: "important_urgent",
    estimateHours: 12,
    status: "in_progress",
    category: "study",
  }),
  mkTask({
    id: "t2",
    feature: "Tính năng tạo & quản lý Task",
    title: "Ma trận Eisenhower (phân loại theo ma trận)",
    subject: "CSDL",
    detail: "Hiển thị 4 góc phân loại, kéo thả task sang từng góc.",
    deadline: addDays(today(), 17),
    assignee: "Thành viên A",
    difficulty: "medium",
    impact: "high",
    quadrant: "important_not_urgent",
    estimateHours: 8,
    category: "study",
  }),
  mkTask({
    id: "t3",
    feature: "Tính năng tạo & quản lý Task",
    title: "Bảng lịch tuần (weekly board)",
    subject: "CSDL",
    detail: "Lưới 7 ngày × các khung giờ, hiển thị task theo tuần.",
    deadline: addDays(today(), 24),
    assignee: "Thành viên A",
    difficulty: "hard",
    impact: "high",
    quadrant: "important_not_urgent",
    estimateHours: 10,
    category: "study",
  }),
  mkTask({
    id: "t4",
    feature: "Cảnh báo & Nhắc nhở",
    title: "Tự động cảnh báo khi nhiều task trùng deadline",
    subject: "Hệ thống",
    detail: "Kiểm tra theo ngày, hiển thị cảnh báo cho các task trùng hoặc sát giờ nộp.",
    deadline: addDays(today(), 20),
    assignee: "Thành viên B",
    difficulty: "medium",
    impact: "medium",
    quadrant: "important_not_urgent",
    estimateHours: 8,
    status: "blocked",
    issues: "Chưa chốt được quy tắc \"sát giờ\" (mấy ngày được coi là trùng).",
    memo: "Cần hỏi lại giảng viên ở buổi review.",
    category: "study",
  }),
  mkTask({
    id: "t5",
    feature: "Cảnh báo & Nhắc nhở",
    title: "Notification nhắc theo Personal Deadline",
    subject: "Hệ thống",
    detail: "Danh sách ngày nộp cá nhân, gửi thông báo đẩy.",
    deadline: addDays(today(), 28),
    assignee: "Thành viên B",
    difficulty: "easy",
    impact: "medium",
    quadrant: "important_not_urgent",
    estimateHours: 6,
    category: "study",
  }),
  mkTask({
    id: "t6",
    feature: "Tích hợp lịch",
    title: "Time-blocking: kéo thả task vào lịch (Calendar)",
    subject: "Tích hợp",
    detail: "Tích hợp Google Calendar, kéo thả task vào khung giờ trống.",
    deadline: addDays(today(), 35),
    assignee: "Trưởng nhóm",
    difficulty: "hard",
    impact: "high",
    quadrant: "important_not_urgent",
    estimateHours: 14,
    category: "study",
  }),
  mkTask({
    id: "t7",
    feature: "Tích hợp lịch",
    title: "Template email xin gia hạn tự động",
    subject: "Tiện ích",
    detail: "Sinh email tiếng Việt/Anh/Nhật theo task, copy vào clipboard.",
    deadline: addDays(today(), 31),
    assignee: "Thành viên B",
    difficulty: "easy",
    impact: "low",
    quadrant: "not_important_not_urgent",
    estimateHours: 5,
    status: "in_progress",
    category: "study",
  }),
  mkTask({
    id: "t8",
    feature: "Thuật toán ưu tiên",
    title: "Gợi ý thứ tự ưu tiên theo deadline / độ khó / ảnh hưởng",
    subject: "Thuật toán",
    detail: "Tính điểm ưu tiên, sắp xếp danh sách task theo thứ tự đề xuất.",
    deadline: addDays(today(), 38),
    assignee: "Trưởng nhóm",
    difficulty: "hard",
    impact: "high",
    quadrant: "important_not_urgent",
    estimateHours: 10,
    category: "study",
  }),
  mkTask({
    id: "t9",
    feature: "Nhóm học tập",
    title: "Bình chọn lịch họp nhóm (Meeting poll)",
    subject: "Tính năng",
    detail: "Đề xuất các khung giờ rảnh chung, thành viên bấm chọn.",
    deadline: addDays(today(), 14),
    assignee: "Thành viên A",
    difficulty: "medium",
    impact: "medium",
    quadrant: "important_urgent",
    estimateHours: 6,
    category: "club",
  }),
  mkTask({
    id: "t10",
    feature: "Cơ hội & Hỗ trợ",
    title: "Module cơ hội việc làm thêm / học bổng",
    subject: "Tính năng",
    detail: "Danh sách cơ hội, lưu để xem sau.",
    deadline: addDays(today(), 45),
    assignee: "Thành viên B",
    difficulty: "easy",
    impact: "low",
    quadrant: "not_important_not_urgent",
    estimateHours: 4,
    category: "personal",
  }),
];

export const SAMPLE_CALENDAR: CalendarEvent[] = [
  { id: "c1", title: "CSDL — Giảng viên A", date: addDays(today(), 1), startHour: 8, durationHours: 2, kind: "class" },
  { id: "c2", title: "CSDL — Giảng viên B", date: addDays(today(), 2), startHour: 13, durationHours: 2, kind: "class" },
  { id: "c3", title: "Ca làm thêm", date: addDays(today(), 3), startHour: 18, durationHours: 4, kind: "work" },
  { id: "c4", title: "CLB Tiếng Anh", date: addDays(today(), 4), startHour: 19, durationHours: 2, kind: "club" },
];

export const SAMPLE_STATE: TrackerState = {
  profile: {
    fullName: "Nguyễn Văn A",
    faculty: "Kỹ thuật Phần mềm",
    year: 3,
    gender: "unspecified",
    studentId: "20235654",
    onboarded: true,
  },
  tasks: SAMPLE_TASKS,
  members: SAMPLE_MEMBERS,
  timeBudget: { maxHoursPerDay: 6, maxHoursPerWeek: 30 },
  quietHours: { enabled: true, startHour: 22, endHour: 7 },
  peakMode: { enabled: false, pushedToWeekOf: addDays(startOfWeek(), 7) },
  calendarEvents: SAMPLE_CALENDAR,
  notifications: [],
  meetingSlots: [],
  extensionRequests: [],
  weekStart: startOfWeek(),
};

export function buildInitialState(): TrackerState {
  const reminders = generateReminders(SAMPLE_TASKS);
  const notifications: AppNotification[] = reminders.map((r, i) => ({
    id: `n-${r.taskId}-${i}`,
    title: r.title,
    body: r.body,
    at: new Date().toISOString(),
    read: false,
    taskId: r.taskId,
  }));
  return { ...SAMPLE_STATE, notifications };
}

// ------------------------------------------------------- derived demo -----

export function demoDerived(state: TrackerState) {
  const visible = applyPeakMode(state);
  return {
    visible,
    workload: buildWorkload(visible, state.members),
    priority: computePriority(visible),
    conflicts: detectConflicts(visible),
    weekDays: weekDays(state.weekStart),
  };
}

export type { Difficulty, Impact, Quadrant, TaskCategory, ProgressStatus, TimeBlock };
