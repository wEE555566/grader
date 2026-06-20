// Helpers for reading an exam set's `metadata_info`.
//
// The backend stores `metadata_info` in a JSONB column and serialises it back as
// a JSON *object*. A few code paths instead hold it as a JSON *string* (optimistic
// local state after an edit, dev mocks, some legacy rows), and very old rows store
// a bare array of questions. Calling `JSON.parse` on an already-parsed object
// throws (`"[object Object]" is not valid JSON`), which silently emptied every
// question preview across the app. These helpers normalise all shapes and never
// throw.

export interface ExamQuestion {
  question?: string;
  question_type?: string;
  choices?: string[];
  answer?: string;
  explanation?: string;
  bloom_level?: string;
  max_score?: number;
  rubric?: Array<{ name: string; description?: string; max_score: number }>;
  [key: string]: unknown;
}

/** The two runtime shapes `metadata_info` can arrive in. */
export type ExamMetaInfo = string | Record<string, unknown>;

/**
 * Normalise a `metadata_info` value into a parsed object (or null).
 * Accepts a JSON string, an already-parsed object, or a bare questions array.
 */
export function parseExamMeta<T = Record<string, unknown>>(
  metadataInfo?: ExamMetaInfo | null,
): T | null {
  if (!metadataInfo) return null;
  try {
    const parsed =
      typeof metadataInfo === 'string' ? JSON.parse(metadataInfo) : metadataInfo;
    if (Array.isArray(parsed)) return { questions: parsed } as T;
    if (parsed && typeof parsed === 'object') return parsed as T;
    return null;
  } catch {
    return null;
  }
}

/** Convenience: the questions array (empty when absent or unparseable). */
export function parseExamQuestions(metadataInfo?: ExamMetaInfo | null): ExamQuestion[] {
  return parseExamMeta<{ questions?: ExamQuestion[] }>(metadataInfo)?.questions ?? [];
}
