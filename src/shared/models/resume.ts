import { and, count, desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { resume } from '@/config/db/schema';
import {
  parseStructuredResume,
  parseTailoredResumeAnalysis,
  type StructuredResume,
  type TailoredResumeAnalysis,
} from '@/shared/resume/schema';

export type Resume = typeof resume.$inferSelect;
export type NewResume = typeof resume.$inferInsert;
export type UpdateResume = Partial<Omit<NewResume, 'id' | 'createdAt'>>;

export enum ResumeStatus {
  PARSED = 'parsed',
  TAILORED = 'tailored',
  ARCHIVED = 'archived',
}

export async function createResume(newResume: NewResume): Promise<Resume> {
  const [result] = await db().insert(resume).values(newResume).returning();
  return result;
}

export async function getResumes({
  userId,
  status,
  limit = 50,
}: {
  userId: string;
  status?: ResumeStatus;
  limit?: number;
}): Promise<Resume[]> {
  return db()
    .select()
    .from(resume)
    .where(
      and(
        eq(resume.userId, userId),
        status ? eq(resume.status, status) : undefined
      )
    )
    .orderBy(desc(resume.updatedAt))
    .limit(limit);
}

export async function getResumesCount({
  userId,
  status,
}: {
  userId: string;
  status?: ResumeStatus;
}) {
  const [result] = await db()
    .select({ count: count() })
    .from(resume)
    .where(
      and(
        eq(resume.userId, userId),
        status ? eq(resume.status, status) : undefined
      )
    );

  return result?.count || 0;
}

export async function findResumeById(id: string) {
  const [result] = await db().select().from(resume).where(eq(resume.id, id));
  return result;
}

export async function updateResumeById(id: string, values: UpdateResume) {
  const [result] = await db()
    .update(resume)
    .set(values)
    .where(eq(resume.id, id))
    .returning();

  return result;
}

export function parseResumeContent(value?: string | null): StructuredResume | null {
  if (!value) {
    return null;
  }

  try {
    return parseStructuredResume(JSON.parse(value));
  } catch {
    return null;
  }
}

export function parseResumeAnalysis(
  value?: string | null
): TailoredResumeAnalysis | null {
  if (!value) {
    return null;
  }

  try {
    return parseTailoredResumeAnalysis(JSON.parse(value));
  } catch {
    return null;
  }
}
