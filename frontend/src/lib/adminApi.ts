/**
 * Admin API client — all admin dashboard API calls.
 * Uses apiFetch from the existing api.ts module.
 */

import { API_BASE_URL } from './api';

const ADMIN_PREFIX = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/admin`;

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${ADMIN_PREFIX}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Admin API error ${res.status}: ${errorBody}`);
  }

  if (res.headers.get('content-type')?.includes('text/csv')) {
    return (await res.blob()) as unknown as T;
  }

  return res.json();
}

// ─── Health ──────────────────────────────────────────────
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down';
  latency_ms: number;
  error?: string;
}

export interface HealthResponse {
  overall: 'healthy' | 'degraded';
  services: ServiceHealth[];
  checked_at: number;
}

export interface OverviewStats {
  total_users: number;
  total_regular_users: number;
  total_moderators: number;
  total_exam_sets: number;
  total_classrooms: number;
  total_attempts: number;
  pending_reports: number;
  ai_gens_today: number;
}

export const adminHealth = {
  getServices: () => adminFetch<HealthResponse>('/health/services'),
  getOverview: () => adminFetch<OverviewStats>('/health/overview'),
};

// ─── Users ──────────────────────────────────────────────
export interface AdminUser {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    school_name: string | null;
  } | null;
}

export interface UserDetail extends AdminUser {
  deleted_at: string | null;
  activity: {
    workspace_count: number;
    exam_set_count: number;
    classroom_count: number;
    attempt_count: number;
    ai_usage_count: number;
  };
}

export interface UserTokenUsage {
  user_id: number;
  tokens_used: number;
  token_limit: number;
  tokens_remaining: number;
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  date: string;
}

export interface UserListResponse {
  total: number;
  users: AdminUser[];
}

export const adminUsers = {
  list: (params: { skip?: number; limit?: number; role?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<UserListResponse>(`/users/?${qs.toString()}`);
  },
  getDetail: (id: number) => adminFetch<UserDetail>(`/users/${id}`),
  changeRole: (id: number, role: string) => adminFetch<{ message: string }>(`/users/${id}/role?role=${role}`, { method: 'PATCH' }),
  toggleSuspend: (id: number) => adminFetch<{ message: string; is_active: boolean }>(`/users/${id}/suspend`, { method: 'PATCH' }),
  deleteUser: (id: number) => adminFetch<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
  impersonate: (id: number) => adminFetch<{ access_token: string; role: string; expires_in: number }>(`/users/${id}/impersonate`, { method: 'POST' }),
  getTokenUsage: (id: number) => adminFetch<UserTokenUsage>(`/users/${id}/token-usage`),
  setCreditLimit: (id: number, creditLimit: number) => adminFetch<{ message: string; credit_limit: number }>(`/users/${id}/token-limit?credit_limit=${creditLimit}`, { method: 'PATCH' }),
};

// ─── Content Moderation ─────────────────────────────────
export interface ContentReportItem {
  id: number;
  exam_set_id: number;
  exam_title: string | null;
  reporter_id: number | null;
  reporter_email: string | null;
  reason: string;
  description: string | null;
  status: string;
  admin_note: string | null;
  reviewed_by: number | null;
  reviewer_email: string | null;
  reviewed_at: string | null;
  created_at: string | null;
}

export interface ReportListResponse {
  total: number;
  reports: ContentReportItem[];
}

export const adminModeration = {
  listReports: (params: { skip?: number; limit?: number; status?: string; reason?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<ReportListResponse>(`/moderation/reports?${qs.toString()}`);
  },
  getReport: (id: number) => adminFetch<ContentReportItem>(`/moderation/reports/${id}`),
  reviewReport: (id: number, action: string, adminNote?: string) => {
    const qs = new URLSearchParams({ action });
    if (adminNote) qs.set('admin_note', adminNote);
    return adminFetch<{ message: string }>(`/moderation/reports/${id}?${qs.toString()}`, { method: 'PATCH' });
  },
  unpublish: (examSetId: number, reason: string) =>
    adminFetch<{ message: string }>(`/moderation/unpublish/${examSetId}?reason=${encodeURIComponent(reason)}`, { method: 'POST' }),
  getFlagged: () => adminFetch<Array<{ exam_set_id: number; title: string; is_public: boolean; pending_report_count: number }>>('/moderation/flagged'),
};

// ─── Audit Logs ─────────────────────────────────────────
export interface AuditLogEntry {
  id?: number;
  user_id: number;
  user_email?: string;
  action: string;
  resource: string | null;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

export interface AuditLogResponse {
  total: number;
  logs: AuditLogEntry[];
  source: string;
}

export const adminAudit = {
  search: (params: { skip?: number; limit?: number; user_id?: number; action?: string; search?: string; date_from?: string; date_to?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<AuditLogResponse>(`/audit/logs?${qs.toString()}`);
  },
  exportCSV: (params: { user_id?: number; action?: string; date_from?: string; date_to?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${ADMIN_PREFIX}/audit/export?${qs.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  },
};

// ─── AI Usage ───────────────────────────────────────────
export interface DailyUsage {
  date: string;
  gen_count: number;
  total_tokens: number;
  total_cost_usd: number;
  error_count: number;
}

export interface UsageSummaryResponse {
  period_days: number;
  daily: DailyUsage[];
  totals: {
    gen_count: number;
    total_tokens: number;
    total_cost_usd: number;
    error_count: number;
  };
}

export interface TopUserUsage {
  user_id: number;
  email: string;
  gen_count: number;
  total_tokens: number;
  total_cost_usd: number;
}

export interface FeatureUsage {
  action: string;
  label: string;
  call_count: number;
  total_tokens: number;
  total_cost_usd: number;
  error_count: number;
  avg_duration_ms: number;
}

export interface UserActionBreakdown {
  action: string;
  label: string;
  call_count: number;
  total_tokens: number;
  total_cost_usd: number;
  error_count: number;
}

export interface UserUsageLog {
  id: number;
  action: string;
  model_name: string | null;
  total_tokens: number;
  estimated_cost_usd: number;
  duration_ms: number;
  status: string;
  error_message: string | null;
  created_at: string | null;
}

export interface UserUsageDetail {
  user_id: number;
  email: string;
  totals: {
    gen_count: number;
    total_tokens: number;
    total_cost_usd: number;
    error_count: number;
  };
  by_action: UserActionBreakdown[];
  daily: { date: string; gen_count: number; total_tokens: number; total_cost_usd: number }[];
  recent_logs: UserUsageLog[];
}

export const adminAIUsage = {
  getSummary: (days = 30) => adminFetch<UsageSummaryResponse>(`/ai-usage/summary?days=${days}`),
  getByUser: (days = 7, limit = 50) => adminFetch<TopUserUsage[]>(`/ai-usage/by-user?days=${days}&limit=${limit}`),
  getByFeature: (days = 30) => adminFetch<FeatureUsage[]>(`/ai-usage/by-feature?days=${days}`),
  getUserDetail: (userId: number, days = 30) => adminFetch<UserUsageDetail>(`/ai-usage/user/${userId}?days=${days}`),
  getJobs: (params: { status?: string; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<{ summary: Record<string, number>; total: number; jobs: Array<{ id: number; workspace_id: number; status: string; error_message: string | null; created_at: string | null; updated_at: string | null }> }>(`/ai-usage/jobs?${qs.toString()}`);
  },
  getAnomalies: (days = 7) => adminFetch<{ threshold: number; flagged_users: Array<{ user_id: number; email: string; gen_count: number; avg_gen_count: number; multiplier: number }> }>(`/ai-usage/anomalies?days=${days}`),
};

// ─── Feature Flags ──────────────────────────────────────
export interface FeatureFlagsResponse {
  flags: Record<string, boolean>;
  message?: string;
}

export const adminFeatures = {
  get: () => adminFetch<FeatureFlagsResponse>('/features/'),
  update: (flags: Record<string, boolean>) =>
    adminFetch<FeatureFlagsResponse>('/features/', {
      method: 'PUT',
      body: JSON.stringify({ flags }),
    }),
  getAnnouncements: () =>
    adminFetch<{ announcements: Array<{ id: string; message: string; banner_type: string; link_text?: string | null; link_url?: string | null; created_at: number; expires_at: number }> }>('/features/announcements'),
  createAnnouncement: (body: { message: string; banner_type: string; link_text?: string | null; link_url?: string | null; duration_hours?: number }) =>
    adminFetch<{ announcement: any; message: string }>('/features/announcements', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteAnnouncement: (id: string) =>
    adminFetch<{ message: string }>(`/features/announcements/${id}`, { method: 'DELETE' }),
};

// ─── Problem Reports ────────────────────────────────────
export interface ProblemReportItem {
  id: number;
  reporter_id: number | null;
  reporter_email: string | null;
  category: string;
  description: string;
  status: string;
  admin_note: string | null;
  reviewed_by: number | null;
  reviewer_email: string | null;
  reviewed_at: string | null;
  created_at: string | null;
}

export interface ProblemReportListResponse {
  total: number;
  reports: ProblemReportItem[];
}

export const adminProblemReports = {
  list: (params: { skip?: number; limit?: number; status?: string; category?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<ProblemReportListResponse>(`/problem-reports/?${qs.toString()}`);
  },
  get: (id: number) => adminFetch<ProblemReportItem>(`/problem-reports/${id}`),
  update: (id: number, action: string, adminNote?: string) => {
    const qs = new URLSearchParams({ action });
    if (adminNote) qs.set('admin_note', adminNote);
    return adminFetch<{ message: string }>(`/problem-reports/${id}?${qs.toString()}`, { method: 'PATCH' });
  },
};

// ─── Classrooms ──────────────────────────────────────────
export interface AdminClassroom {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  teacher_id: number;
  teacher_email: string | null;
  workspace_id: number;
  workspace_name: string | null;
  student_count: number;
}

export interface AdminClassroomStudent {
  id: number;
  email: string | null;
  enrolled_at: string;
}

export interface AdminClassroomDetail extends AdminClassroom {
  students: AdminClassroomStudent[];
}

export interface ClassroomListResponse {
  total: number;
  classrooms: AdminClassroom[];
}

export const adminClassrooms = {
  list: (params: { skip?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<ClassroomListResponse>(`/classrooms/?${qs.toString()}`);
  },
  getDetail: (id: number) => adminFetch<AdminClassroomDetail>(`/classrooms/${id}`),
  toggle: (id: number) => adminFetch<{ message: string; is_active: boolean }>(`/classrooms/${id}/toggle`, { method: 'PATCH' }),
  softDelete: (id: number) => adminFetch<{ message: string; classroom_id: number }>(`/classrooms/${id}/soft-delete`, { method: 'PATCH' }),
  restore: (id: number) => adminFetch<{ message: string; classroom_id: number }>(`/classrooms/${id}/restore`, { method: 'PATCH' }),
  hardDelete: (id: number) => adminFetch<{ message: string; classroom_id: number }>(`/classrooms/${id}`, { method: 'DELETE' }),
};

// ─── Exam Sets (Admin) ────────────────────────────────────
export interface AdminExamSet {
  id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  is_deleted: boolean;
  sharing_type: string;
  license_type: string;
  created_at: string;
  published_at: string | null;
  deleted_at: string | null;
  workspace_id: number;
  workspace_name: string | null;
  owner_id: number | null;
  owner_email: string | null;
  question_count: number;
  attempt_count: number;
}

export interface ExamSetListResponse {
  total: number;
  exam_sets: AdminExamSet[];
}

export const adminExamSets = {
  list: (params: { skip?: number; limit?: number; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<ExamSetListResponse>(`/exam-sets/?${qs.toString()}`);
  },
  getDetail: (id: number) => adminFetch<AdminExamSet>(`/exam-sets/${id}`),
  softDelete: (id: number) => adminFetch<{ message: string; exam_set_id: number }>(`/exam-sets/${id}/soft-delete`, { method: 'PATCH' }),
  restore: (id: number) => adminFetch<{ message: string; exam_set_id: number }>(`/exam-sets/${id}/restore`, { method: 'PATCH' }),
  hardDelete: (id: number) => adminFetch<{ message: string; exam_set_id: number }>(`/exam-sets/${id}`, { method: 'DELETE' }),
};

// ─── Attempts (Admin) ─────────────────────────────────────
export interface AdminAttempt {
  id: number;
  student_id: number | null;
  student_email: string | null;
  guest_name: string | null;
  exam_set_id: number;
  exam_set_title: string | null;
  classroom_id: number | null;
  classroom_name: string | null;
  score: number;
  total_questions: number;
  score_pct: number;
  essay_grading_status: string | null;
  started_at: string;
  submitted_at: string;
}

export interface AdminAttemptDetail extends AdminAttempt {
  answers: unknown;
  essay_scores: unknown;
}

export interface AttemptListResponse {
  total: number;
  attempts: AdminAttempt[];
}

export const adminAttempts = {
  list: (params: { skip?: number; limit?: number; exam_set_id?: number; classroom_id?: number; student_id?: number; search?: string }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, String(v)); });
    return adminFetch<AttemptListResponse>(`/attempts/?${qs.toString()}`);
  },
  getDetail: (id: number) => adminFetch<AdminAttemptDetail>(`/attempts/${id}`),
  remove: (id: number) => adminFetch<{ message: string; attempt_id: number }>(`/attempts/${id}`, { method: 'DELETE' }),
};
