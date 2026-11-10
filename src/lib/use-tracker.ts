"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addWeeks,
  applyPeakMode,
  buildWorkload,
  computePriority,
  detectConflicts,
  generateReminders,
  hiddenByPeakMode,
  startOfWeek,
} from "./domain";
import { buildInitialState } from "./sample-data";
import type {
  AppNotification,
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

const STORAGE_KEY = "mvp-progress-tracker:v2";

function emptyState(): TrackerState {
  return {
    profile: {
      fullName: "",
      faculty: "",
      year: 1,
      gender: "unspecified",
      studentId: "",
      onboarded: false,
    },
    tasks: [],
    members: [],
    timeBudget: { maxHoursPerDay: 6, maxHoursPerWeek: 30 },
    quietHours: { enabled: false, startHour: 22, endHour: 7 },
    peakMode: { enabled: false, pushedToWeekOf: addWeeks(startOfWeek(), 1) },
    calendarEvents: [],
    notifications: [],
    meetingSlots: [],
    extensionRequests: [],
    weekStart: startOfWeek(),
  };
}

function loadState(): TrackerState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as Partial<TrackerState>;
    const base = emptyState();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      timeBudget: { ...base.timeBudget, ...(parsed.timeBudget ?? {}) },
      quietHours: { ...base.quietHours, ...(parsed.quietHours ?? {}) },
      peakMode: { ...base.peakMode, ...(parsed.peakMode ?? {}) },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : base.tasks,
      members: Array.isArray(parsed.members) ? parsed.members : base.members,
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      meetingSlots: Array.isArray(parsed.meetingSlots) ? parsed.meetingSlots : [],
      extensionRequests: Array.isArray(parsed.extensionRequests) ? parsed.extensionRequests : [],
    };
  } catch {
    return buildInitialState();
  }
}

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export interface TaskDraft {
  id?: string;
  feature: string;
  title: string;
  subject?: string;
  detail?: string;
  deadline: string;
  personalDeadline?: string;
  assignee?: string;
  difficulty: Difficulty;
  impact: Impact;
  quadrant?: Quadrant;
  estimateHours: number;
  status?: ProgressStatus;
  issues?: string;
  memo?: string;
  category?: TaskCategory;
  blocks?: TimeBlock[];
}

export function useTracker() {
  const [state, setState] = useState<TrackerState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded — bỏ qua */
    }
  }, [state, hydrated]);

  // ------------------------------------------------------------ tasks ----

  const upsertTask = useCallback((draft: TaskDraft) => {
    setState((prev) => {
      const timestamp = new Date().toISOString();
      if (draft.id) {
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === draft.id
              ? {
                  ...t,
                  ...draft,
                  estimateHours: Number(draft.estimateHours) || 0,
                  updatedAt: timestamp,
                }
              : t,
          ),
        };
      }
      const task: Task = {
        id: newId("t"),
        feature: draft.feature,
        title: draft.title,
        subject: draft.subject ?? "",
        detail: draft.detail ?? "",
        deadline: draft.deadline,
        personalDeadline: draft.personalDeadline ?? "",
        assignee: draft.assignee ?? "",
        difficulty: draft.difficulty,
        impact: draft.impact,
        quadrant: draft.quadrant ?? "important_not_urgent",
        estimateHours: Number(draft.estimateHours) || 0,
        status: draft.status ?? "not_started",
        issues: draft.issues ?? "",
        memo: draft.memo ?? "",
        category: draft.category ?? "study",
        blocks: draft.blocks ?? [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return { ...prev, tasks: [...prev.tasks, task] };
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
      notifications: prev.notifications.filter((n) => n.taskId !== id),
    }));
  }, []);

  const setTaskStatus = useCallback((id: string, status: ProgressStatus) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }, []);

  const setTaskQuadrant = useCallback((id: string, quadrant: Quadrant) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, quadrant, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }, []);

  const addTimeBlock = useCallback((taskId: string, block: Omit<TimeBlock, "id">) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, blocks: [...t.blocks, { ...block, id: newId("b") }], updatedAt: new Date().toISOString() }
          : t,
      ),
    }));
  }, []);

  const removeTimeBlock = useCallback((taskId: string, blockId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, blocks: t.blocks.filter((b) => b.id !== blockId), updatedAt: new Date().toISOString() }
          : t,
      ),
    }));
  }, []);

  // --------------------------------------------------------- members ----

  const upsertMember = useCallback((input: Partial<Member> & { name: string }) => {
    setState((prev) => {
      if (input.id) {
        return {
          ...prev,
          members: prev.members.map((m) =>
            m.id === input.id
              ? { ...m, ...input, capacityHours: Number(input.capacityHours) || 0 }
              : m,
          ),
        };
      }
      return {
        ...prev,
        members: [
          ...prev.members,
          { id: newId("m"), name: input.name, capacityHours: Number(input.capacityHours) || 0, freeSlots: [] },
        ],
      };
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));
  }, []);

  // -------------------------------------------------------- settings ----

  const setWeekStart = useCallback((weekStart: string) => {
    setState((prev) => ({ ...prev, weekStart }));
  }, []);

  const shiftWeek = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, weekStart: addWeeks(prev.weekStart, delta) }));
  }, []);

  const setTimeBudget = useCallback((budget: Partial<TrackerState["timeBudget"]>) => {
    setState((prev) => ({ ...prev, timeBudget: { ...prev.timeBudget, ...budget } }));
  }, []);

  const setQuietHours = useCallback((quiet: Partial<TrackerState["quietHours"]>) => {
    setState((prev) => ({ ...prev, quietHours: { ...prev.quietHours, ...quiet } }));
  }, []);

  const setPeakMode = useCallback((peak: Partial<TrackerState["peakMode"]>) => {
    setState((prev) => ({ ...prev, peakMode: { ...prev.peakMode, ...peak } }));
  }, []);

  const setProfile = useCallback((profile: Partial<TrackerState["profile"]>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }));
  }, []);

  // --------------------------------------------------- notifications ----

  const refreshNotifications = useCallback(() => {
    setState((prev) => {
      const reminders = generateReminders(prev.tasks);
      const existing = new Set(prev.notifications.map((n) => n.taskId));
      const fresh: AppNotification[] = reminders
        .filter((r) => !existing.has(r.taskId))
        .map((r) => ({
          id: newId("nt"),
          title: r.title,
          body: r.body,
          at: new Date().toISOString(),
          read: false,
          taskId: r.taskId,
        }));
      return { ...prev, notifications: [...fresh, ...prev.notifications] };
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  // ------------------------------------------------- extension request ----

  const addExtensionRequest = useCallback(
    (input: { taskId: string; requestedDays: number; newDeadline: string; message: string; template: "vi" | "en" | "ja" }) => {
      setState((prev) => ({
        ...prev,
        extensionRequests: [
          ...prev.extensionRequests,
          { id: newId("ex"), createdAt: new Date().toISOString(), ...input },
        ],
      }));
    },
    [],
  );

  // ------------------------------------------------------- import/export --

  const resetToSample = useCallback(() => {
    setState(buildInitialState());
  }, []);

  const clearAll = useCallback(() => {
    setState(emptyState());
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mvp-progress-tracker.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importJson = useCallback((raw: string): string | null => {
    try {
      const parsed = JSON.parse(raw) as Partial<TrackerState>;
      if (!Array.isArray(parsed.tasks)) return "File không hợp lệ: thiếu mảng 'tasks'.";
      setState({ ...emptyState(), ...parsed });
      return null;
    } catch {
      return "Không đọc được file JSON.";
    }
  }, []);

  // --------------------------------------------------------- derived ----

  const visibleTasks = useMemo(() => applyPeakMode(state), [state]);
  const hiddenTasks = useMemo(() => hiddenByPeakMode(state), [state]);
  const workload = useMemo(() => buildWorkload(visibleTasks, state.members), [visibleTasks, state.members]);
  const priority = useMemo(() => computePriority(visibleTasks), [visibleTasks]);
  const conflicts = useMemo(() => detectConflicts(visibleTasks), [visibleTasks]);

  const overall = useMemo(() => {
    const tasks = visibleTasks;
    const estimateTotal = tasks.reduce((s, t) => s + t.estimateHours, 0);
    const progress = tasks.length
      ? tasks.reduce((s, t) => s + (t.status === "done" ? 1 : t.status === "not_started" ? 0 : 0.5), 0) / tasks.length
      : 0;
    const capacityTotal = state.members.reduce((s, m) => s + m.capacityHours, 0);
    return {
      totalTasks: tasks.length,
      estimateTotal,
      capacityTotal,
      progress,
      done: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      notStarted: tasks.filter((t) => t.status === "not_started").length,
      overdue: tasks.filter(
        (t) => t.deadline && t.status !== "done" && new Date(t.deadline + "T23:59:59") < new Date(),
      ).length,
      utilization: capacityTotal > 0 ? estimateTotal / capacityTotal : 0,
      unreadNotifications: state.notifications.filter((n) => !n.read).length,
    };
  }, [visibleTasks, state.members, state.notifications]);

  return {
    // state
    ...state,
    hydrated,
    // derived
    visibleTasks,
    hiddenTasks,
    workload,
    priority,
    conflicts,
    overall,
    // actions
    upsertTask,
    removeTask,
    setTaskStatus,
    setTaskQuadrant,
    addTimeBlock,
    removeTimeBlock,
    upsertMember,
    removeMember,
    setWeekStart,
    shiftWeek,
    setTimeBudget,
    setQuietHours,
    setPeakMode,
    setProfile,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    addExtensionRequest,
    resetToSample,
    clearAll,
    exportJson,
    importJson,
  };
}

export type TrackerApi = ReturnType<typeof useTracker>;
