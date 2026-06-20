const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NEXT_PUBLIC_BASE_PATH) return process.env.NEXT_PUBLIC_BASE_PATH;

  // Fallback: detect /qookru from window location if in browser
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/qookru')) {
    return '/qookru';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
// ===== Core Fetch =====
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // An expired/invalid token must not leave the app half-logged-in (token present
    // but every call 401s). Clear it so route guards send the user back to /login.
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `เกิดข้อผิดพลาด (HTTP ${response.status})`);
  }

  return response.json();
}

// ===== Auth =====
export interface UserProfile {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profile?: {
    id: number;
    first_name?: string;
    last_name?: string;
    school_name?: string;
    profile_picture?: string;
  };
}

export async function getCurrentUser(): Promise<UserProfile> {
  // DEV ONLY: when the local /dev-login bypass is active, return a mock user
  // instead of hitting the backend. Lets you browse auth-gated pages with no
  // server running. The NODE_ENV guard makes this dead-code in production builds.
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    localStorage.getItem('dev_bypass_auth') === 'true'
  ) {
    return {
      id: 0,
      email: 'dev@local.test',
      role: localStorage.getItem('role') || 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      profile: { id: 0, first_name: 'Dev', last_name: 'Preview', school_name: 'Local' },
    };
  }
  return apiFetch('/api/v1/auth/me');
}

export async function loginWithGoogle(credential: string, role: string): Promise<{ access_token: string, role: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, role })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Google Login failed');
  }

  const data = await response.json();
  const token = data.access_token;

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }

  const user = await apiFetch('/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  return { access_token: token, role: user.role };
}


// ===== Workspaces =====
export interface Workspace {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  created_at: string;
  exam_set_count: number;
}

export async function getWorkspaces(): Promise<Workspace[]> {
  return apiFetch('/api/v1/workspaces/');
}

export async function getWorkspace(id: number): Promise<Workspace> {
  return apiFetch(`/api/v1/workspaces/${id}`);
}

export async function createWorkspace(name: string, description?: string): Promise<Workspace> {
  return apiFetch('/api/v1/workspaces/', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export async function updateWorkspace(id: number, name?: string, description?: string): Promise<Workspace> {
  return apiFetch(`/api/v1/workspaces/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, description }),
  });
}

export async function deleteWorkspace(id: number): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/workspaces/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete workspace');
  }
}

// ===== AI Generator & Exam Sets =====

export interface RubricCriteria {
  name: string;
  description: string;
  max_score: number;
}

export interface ExamQuestion {
  question: string;
  question_type?: 'mcq' | 'essay';
  // MCQ fields
  choices?: string[];
  answer?: string;
  explanation?: string;
  // Essay fields
  rubric?: RubricCriteria[];
  max_score?: number;
  bloom_level?: string;
  parse_error?: boolean;
}

export interface ExamSet {
  id: number;
  workspace_id: number;
  title: string;
  description?: string;
  metadata_info?: string | Record<string, unknown>;
  is_public?: boolean;
  published_at?: string;
  sharing_type?: string;
  license_type?: string;
  snapshot_metadata?: string;
  cloned_from_id?: number;
  source_license_type?: string;
  source_author_name?: string;
  created_at: string;
  updated_at: string;
}

export async function createExamSet(workspaceId: number, title: string, metadataInfo?: string): Promise<ExamSet> {
  return apiFetch('/api/v1/exam-generator/exam-sets/', {
    method: 'POST',
    body: JSON.stringify({
      workspace_id: workspaceId,
      title,
      description: 'สร้างจาก AI',
      metadata_info: metadataInfo,
    }),
  });
}

export async function getExamSets(workspaceId: number): Promise<ExamSet[]> {
  return apiFetch(`/api/v1/exam-generator/exam-sets/${workspaceId}`);
}

export async function deleteExamSet(id: number): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/exam-sets/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete exam set');
  }
}

export async function updateExamSetQuestions(examSetId: number, metadataInfo: string): Promise<ExamSet> {
  return apiFetch(`/api/v1/exam-editor/exam-sets/${examSetId}/questions`, {
    method: 'PATCH',
    body: JSON.stringify({ metadata_info: metadataInfo }),
  });
}

export async function extractDocument(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/extract/`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'Failed to extract text from document');
  }

  return response.text();
}

export interface GenMainParams {
  title?: string;
  content: string;
  question_count?: number;
  bloom_level?: string;
  exam_style?: string;
  choice_count?: number;
  question_type?: 'mcq' | 'essay';
  custom_style_instruction?: string;
}

export async function genMainExamJSON(params: GenMainParams): Promise<{ questions: ExamQuestion[]; token_usage?: { generation_tokens: number; grading_tokens: number } }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // AI generation can take several minutes for large counts. Backend enforces its own
  // budget (~6 min) and pads fallbacks rather than hanging — give the client a bit more
  // headroom so we never abort while the server is still answering.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8 * 60 * 1000); // 8 minutes

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/gen-main`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(errorData.detail || 'โควต้า Token หมดแล้ว กรุณารอวันถัดไป');
      }
      throw new Error(errorData.detail || `เกิดข้อผิดพลาด (${response.status})`);
    }

    return response.json();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('การสร้างข้อสอบใช้เวลานานเกินไป (หมดเวลา 8 นาที) กรุณาลดจำนวนข้อแล้วลองใหม่');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function parseExistingExam(rawText: string): Promise<{ questions: ExamQuestion[] }> {
  return apiFetch('/api/v1/exam-generator/parse-exam', {
    method: 'POST',
    body: JSON.stringify({ raw_exam_text: rawText }),
  });
}

export async function augmentExam(existingQuestions: string, additionalCount: number): Promise<{ questions: ExamQuestion[] }> {
  return apiFetch('/api/v1/exam-generator/augment-exam', {
    method: 'POST',
    body: JSON.stringify({ existing_questions: existingQuestions, additional_count: additionalCount }),
  });
}

export async function generateRubric(question: string, userIdea?: string): Promise<{ rubric: RubricCriteria[] }> {
  return apiFetch('/api/v1/exam-generator/gen-rubric', {
    method: 'POST',
    body: JSON.stringify({ question, user_idea: userIdea || null }),
  });
}

// Legacy functions kept for backward compatibility
export async function genMainExamRaw(content: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/gen-main`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'Failed to generate main exam');
  }
  return response.text();
}

export async function genChoiceRaw(mainExamText: string): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/gen-choice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ main_exam_text: mainExamText })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || 'Failed to generate choices');
  }
  return response.text();
}

// ====== Public Repository ======

export interface PublicExamSet {
  id: number;
  title: string;
  description?: string;
  metadata_info?: string | Record<string, unknown>;
  is_public: boolean;
  sharing_type: string;
  license_type: string;
  published_at?: string;
  created_at: string;
  author_name?: string;
  question_count: number;
}

export async function getPublicExamSets(query?: string): Promise<PublicExamSet[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch(`/api/v1/repository/${params}`);
}

export async function getPublicExamSet(examSetId: number): Promise<PublicExamSet> {
  return apiFetch(`/api/v1/repository/${examSetId}`);
}

export async function cloneExamSet(examSetId: number, workspaceId: number): Promise<ExamSet> {
  return apiFetch(`/api/v1/repository/clone/${examSetId}?workspace_id=${workspaceId}`, {
    method: 'POST',
  });
}

export async function submitProblemReport(category: string, description: string): Promise<{ message: string; id: number }> {
  return apiFetch('/api/v1/problem-reports/', {
    method: 'POST',
    body: JSON.stringify({ category, description }),
  });
}

export async function reportExamSet(examSetId: number, reason: string, description?: string): Promise<{ id: number; exam_set_id: number; reason: string; status: string }> {
  return apiFetch(`/api/v1/repository/${examSetId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason, description: description || null }),
  });
}

export async function togglePublishExamSet(examSetId: number, isPublic: boolean, sharingType: string = "live", licenseType: string = "CC-BY"): Promise<ExamSet> {
  return apiFetch(`/api/v1/exam-generator/exam-sets/${examSetId}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ is_public: isPublic, sharing_type: sharingType, license_type: licenseType }),
  });
}

export async function updateExamSetLicense(examSetId: number, licenseType: string): Promise<ExamSet> {
  return apiFetch(`/api/v1/exam-generator/exam-sets/${examSetId}/license`, {
    method: 'PATCH',
    body: JSON.stringify({ license_type: licenseType }),
  });
}

// ===== Exam History =====
export interface ExamHistoryItem {
  id: number;
  workspace_id: number;
  title: string;
  description?: string;
  metadata_info?: string | Record<string, unknown>;
  created_at: string;
  updated_at: string;
  workspace_name: string;
  question_count: number;
}

export async function getExamHistory(search?: string): Promise<ExamHistoryItem[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const queryString = params.toString();
  return apiFetch(`/api/v1/exam-history/${queryString ? `?${queryString}` : ''}`);
}

// ===== Notifications =====
export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  related_exam_set_id?: number;
  actor_name?: string;
  created_at: string;
}

export async function getNotifications(skip: number = 0, limit: number = 50): Promise<NotificationItem[]> {
  return apiFetch(`/api/v1/notifications/?skip=${skip}&limit=${limit}`);
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return apiFetch('/api/v1/notifications/unread-count');
}

export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  return apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  return apiFetch('/api/v1/notifications/read-all', { method: 'PATCH' });
}

// ===== Classrooms (Teacher) =====
export interface Classroom {
  id: number;
  workspace_id: number;
  teacher_id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  workspace_name: string;
  student_count: number;
}

export async function createClassroom(workspaceId: number, name: string): Promise<Classroom> {
  return apiFetch('/api/v1/classrooms/', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId, name }),
  });
}

export async function getTeacherClassrooms(): Promise<Classroom[]> {
  return apiFetch('/api/v1/classrooms/');
}

export async function getTeacherClassroom(id: number): Promise<Classroom> {
  return apiFetch(`/api/v1/classrooms/${id}`);
}

export async function toggleClassroom(id: number, isActive: boolean): Promise<Classroom> {
  return apiFetch(`/api/v1/classrooms/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function updateClassroom(id: number, name: string): Promise<Classroom> {
  return apiFetch(`/api/v1/classrooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteClassroom(id: number): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}/api/v1/classrooms/${id}`, {
    method: 'DELETE',
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete classroom');
  }
}

// ===== Teacher Analytics =====
export interface StudentResultSummary {
  student_id: number | null;  // null for guest attempts
  role?: string;              // 'guest' for unauthenticated submitters
  student_name: string;
  student_email: string;
  total_attempts: number;
  average_score: number;
  attempts: any[];
}

export interface ClassroomResults {
  classroom_id: number;
  classroom_name: string;
  student_count: number;
  students: StudentResultSummary[];
}

export async function getClassroomResults(id: number): Promise<ClassroomResults> {
  return apiFetch(`/api/v1/classrooms/${id}/results`);
}

// ===== Student Actions =====
export interface StudentClassroom {
  id: number;
  name: string;
  code: string;
  teacher_name: string;
  workspace_name: string;
  is_active: boolean;
  enrolled_at: string;
  exam_set_count: number;
}

export async function joinClassroom(code: string): Promise<StudentClassroom> {
  return apiFetch('/api/v1/student/join', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function guestJoinClassroom(code: string, guestName: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/student/guest-join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, guest_name: guestName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'ไม่สามารถเข้าร่วมห้องได้');
  }
  return response.json();
}

export async function getStudentClassrooms(): Promise<StudentClassroom[]> {
  return apiFetch('/api/v1/student/classrooms');
}

export interface StudentExamSet {
  id: number;
  title: string;
  description: string;
  question_count: number;
  has_attempted: boolean;
  best_score: number | null;
  best_total: number | null;
}

export async function getStudentClassroomExams(classroomId: number): Promise<StudentExamSet[]> {
  return apiFetch(`/api/v1/student/classrooms/${classroomId}/exams`);
}

export interface ExamForTakingRubric {
  name: string;
  description: string;
  max_score: number;
}

export interface ExamForTaking {
  exam_set_id: number;
  title: string;
  description: string;
  questions: {
    question_text: string;
    question_type?: string;  // "mcq" or "essay"
    choices?: string[];      // MCQ only (optional for essay)
    bloom_level?: string | null;
    // Essay-specific
    max_score?: number;
    rubric?: ExamForTakingRubric[];
  }[];
}

export async function getExamForTaking(examSetId: number, classroomId: number): Promise<ExamForTaking> {
  return apiFetch(`/api/v1/student/exams/${examSetId}?classroom_id=${classroomId}`);
}

/** One row of per-question feedback returned by the submit endpoint. */
export interface ExamResultDetail {
  question_idx: number;
  selected: string | null;
  /** Correct choice label; null for essay questions. */
  correct_answer: string | null;
  /** true/false for MCQ; null while an essay is still being graded. */
  is_correct: boolean | null;
  explanation?: string;
}

export interface ExamSubmitResult {
  score: number;
  total_questions: number;
  max_score: number;
  percentage: number;
  details: ExamResultDetail[];
  attempt_id?: number;
  essay_grading_status?: string | null;
  has_essay?: boolean;
}

export async function submitExam(
  examSetId: number,
  classroomId: number,
  answers: { question_idx: number; selected: string }[],
  submitToken?: string,
): Promise<ExamSubmitResult> {
  const token = submitToken
    ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return apiFetch(`/api/v1/student/exams/${examSetId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ classroom_id: classroomId, answers, submit_token: token }),
  });
}

export async function getStudentHistory(): Promise<any[]> {
  return apiFetch('/api/v1/student/history');
}

export interface EssayGradingStatus {
  attempt_id: number;
  status: string | null;
  score: number;
  total_questions: number;
  max_score: number;
  percentage: number;
  essay_scores: any[] | null;
  answers: any[] | null;
}

export async function getEssayGradingStatus(attemptId: number): Promise<EssayGradingStatus> {
  return apiFetch(`/api/v1/student/essay-status/${attemptId}`);
}

export async function getGuestEssayGradingStatus(attemptId: number, submitToken?: string): Promise<EssayGradingStatus> {
  const q = submitToken ? `?token=${encodeURIComponent(submitToken)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/v1/student/essay-status/${attemptId}${q}`);
  if (!res.ok) throw new Error('ไม่สามารถดูสถานะการตรวจได้');
  return res.json();
}

// ===== AI Quality Check =====
export interface QualityIssue {
  question_idx: number;
  severity: 'low' | 'medium' | 'high' | string;
  category: 'format' | 'distractor' | 'accuracy' | 'clarity' | string;
  message: string;
}

export interface StructuredQualityReport {
  overall_score: number;
  summary: string;
  issues: QualityIssue[];
  suggestions: string[];
}

export interface QualityCheckResult {
  result_text: string;
  exam_set_id: number;
  exam_set_title: string;
  structured?: StructuredQualityReport | null;
  check_tokens?: number;
}

export async function qualityCheckExamSet(examSetId: number, questionIndices?: number[]): Promise<QualityCheckResult> {
  const body: any = { exam_set_id: examSetId };
  if (questionIndices && questionIndices.length > 0) {
    body.question_indices = questionIndices;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Quality check involves LLM calls that can take several minutes.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/exam-generator/quality-check-set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(errorData.detail || 'โควต้า Credit หมดแล้ว กรุณารอวันถัดไป');
      }
      throw new Error(errorData.detail || `เกิดข้อผิดพลาดในการวิเคราะห์คุณภาพ (${response.status})`);
    }

    return response.json();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('การวิเคราะห์คุณภาพใช้เวลานานเกินไป (หมดเวลา 5 นาที) กรุณาลดจำนวนข้อแล้วลองใหม่');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ===== LLM Settings =====
export interface LLMSettings {
  provider: string;
  selected_model: string | null;
  has_api_key: boolean;
}

export interface LLMSettingsUpdate {
  provider: string;
  selected_model?: string | null;
  openrouter_api_key?: string | null;
}

export interface LLMModelInfo {
  id: string;
  name: string;
  is_free: boolean;
}

export interface TokenUsage {
  tokens_used: number;
  token_limit: number;
  tokens_remaining: number;
  date: string;
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
}

export interface LLMTestResult {
  success: boolean;
  message: string;
}

export async function getLLMSettings(): Promise<LLMSettings> {
  return apiFetch('/api/v1/llm/settings');
}

export async function updateLLMSettings(settings: LLMSettingsUpdate): Promise<LLMSettings> {
  return apiFetch('/api/v1/llm/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function getLLMModels(): Promise<{ models: LLMModelInfo[] }> {
  return apiFetch('/api/v1/llm/models');
}

export async function getTokenUsage(): Promise<TokenUsage> {
  return apiFetch('/api/v1/llm/usage');
}

export async function testLLMApiKey(apiKey: string, model: string): Promise<LLMTestResult> {
  return apiFetch('/api/v1/llm/test', {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey, model }),
  });
}

export async function testCurrentLLM(): Promise<LLMTestResult> {
  return apiFetch('/api/v1/llm/test-current', {
    method: 'POST',
  });
}

// ===== Feature Flags (Feature-based groups) =====
export interface FeatureFlags {
  ai_engine: boolean;
  public_repository: boolean;
  classroom_system: boolean;
  exam_history: boolean;
  [key: string]: boolean;
}

export interface AnnouncementItem {
  id: string;
  message: string;
  banner_type: string;
  link_text?: string | null;
  link_url?: string | null;
  created_at: number;
  expires_at: number;
}

export async function getFeatureFlags(): Promise<{ flags: FeatureFlags; announcements: AnnouncementItem[] }> {
  // Public endpoint — no auth needed, use raw fetch
  const response = await fetch(`${API_BASE_URL}/api/v1/features/`);
  if (!response.ok) {
    // Fallback: all features enabled if API fails
    return {
      flags: {
        ai_engine: true,
        public_repository: true,
        classroom_system: true,
        exam_history: true,
      },
      announcements: [],
    };
  }
  return response.json();
}

// ===== Leaderboard =====
export interface TopStudent {
  student_id: number;
  name: string;
  role?: string;
  profile_picture?: string;
  total_score: number;
  exams_taken: number;
}

export interface PopularExam {
  exam_set_id: number;
  title: string;
  creator_name: string;
  attempt_count: number;
}

export async function getTopStudents(limit: number = 20): Promise<{ data: TopStudent[] }> {
  return apiFetch(`/api/v1/leaderboard/students?limit=${limit}`);
}

export async function getPopularExams(limit: number = 20): Promise<{ data: PopularExam[] }> {
  return apiFetch(`/api/v1/leaderboard/exams?limit=${limit}`);
}
