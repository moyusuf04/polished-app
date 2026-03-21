'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { checkDedupe } from '@/lib/utils/rate-limit';
import { lessonCreateSchema, lessonUpdateSchema, generateSlug, parseBulkImport } from '@/lib/validators/lesson';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; data?: unknown; error?: string };

async function logAdminAction(action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  await supabase.from('admin_logs').insert({
    admin_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

async function snapshotVersion(lessonId: string, snapshot: Record<string, unknown>) {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  await supabase.from('lesson_versions').insert({
    lesson_id: lessonId,
    snapshot,
    created_by: userId,
  });
}

export async function getLessons(opts: {
  search?: string;
  category_id?: string;
  difficulty?: string;
  status?: string;
  page?: number;
  includeDeleted?: boolean;
} = {}): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const page = opts.page ?? 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from('lessons').select('*', { count: 'exact' })
    .order('position', { ascending: true })
    .range(from, to);

  if (!opts.includeDeleted) query = query.is('deleted_at', null);
  if (opts.search) query = query.ilike('title', `%${opts.search}%`);
  if (opts.category_id) query = query.eq('category_id', opts.category_id);
  if (opts.difficulty) query = query.eq('difficulty', opts.difficulty);
  if (opts.status) query = query.eq('status', opts.status);

  const { data, error, count } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: { lessons: data, total: count, page, pageSize } };
}

export async function getLesson(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  
  // Fetch lesson data and its junction categories
  const { data, error } = await supabase
    .from('lessons')
    .select('*, lesson_categories(category_id)')
    .eq('id', id)
    .single();
    
  if (error) return { success: false, error: error.message };
  
  // Transform lesson_categories into a simple string array
  const category_ids = (data.lesson_categories as Array<{ category_id: string }>)
    ?.map(c => c.category_id) || [];
    
  return { success: true, data: { ...data, category_ids } };
}

export async function createLesson(input: Record<string, unknown>): Promise<ActionResult> {
  const dedup = await checkDedupe(`create-lesson-${input.title}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();

  const parsed = lessonCreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const slug = generateSlug(parsed.data.title);

  const supabase = await createClient();
  const lessonRow = {
    id: slug,
    title: parsed.data.title,
    category_id: parsed.data.category_id,
    difficulty: parsed.data.difficulty,
    description: parsed.data.description ?? '',
    content_slides: parsed.data.content_slides,
    reflection_prompt: parsed.data.reflection_prompt ?? '',
    convo_hooks: parsed.data.convo_hooks ?? [],
    status: parsed.data.status,
    duration: parsed.data.duration ?? '',
    format: parsed.data.format ?? '',
    xp_reward: parsed.data.xp_reward ?? 0,
    cover_image_url: parsed.data.cover_image_url || null,
  };

  const { data, error } = await supabase.from('lessons').insert(lessonRow).select().single();
  if (error) return { success: false, error: error.message };

  // Sync lesson_categories
  const catIds = parsed.data.category_ids || [parsed.data.category_id];
  const junctionRows = catIds.map(cid => ({ lesson_id: slug, category_id: cid }));
  await supabase.from('lesson_categories').insert(junctionRows);

  await logAdminAction('create', 'lesson', slug, { title: parsed.data.title, category_ids: catIds });
  revalidatePath('/admin');
  revalidatePath('/admin/lessons');
  revalidatePath('/hub');

  return { success: true, data };
}

export async function updateLesson(id: string, input: Record<string, unknown>): Promise<ActionResult> {
  const dedup = await checkDedupe(`update-lesson-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();

  const parsed = lessonUpdateSchema.safeParse({ ...input, id });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();

  // Snapshot current state before update
  const { data: current } = await supabase.from('lessons').select('*').eq('id', id).single();
  if (current) {
    await snapshotVersion(id, current);
  }

  const { id: _id, category_ids, ...updates } = parsed.data;
  const { data, error } = await supabase.from('lessons').update(updates).eq('id', id).select().single();
  if (error) return { success: false, error: error.message };

  // Sync lesson_categories: Delete existing and insert new
  if (category_ids) {
    await supabase.from('lesson_categories').delete().eq('lesson_id', id);
    const junctionRows = category_ids.map(cid => ({ lesson_id: id, category_id: cid }));
    await supabase.from('lesson_categories').insert(junctionRows);
  }

  await logAdminAction('update', 'lesson', id, { ...updates, category_ids });
  revalidatePath('/admin');
  revalidatePath('/admin/lessons');
  revalidatePath('/hub');

  return { success: true, data };
}

export async function softDeleteLesson(id: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`delete-lesson-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('lessons').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAdminAction('soft_delete', 'lesson', id);
  revalidatePath('/admin');
  revalidatePath('/admin/lessons');
  revalidatePath('/hub');
  return { success: true };
}

export async function restoreLesson(id: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`restore-lesson-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('lessons').update({ deleted_at: null }).eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAdminAction('restore', 'lesson', id);
  revalidatePath('/admin');
  revalidatePath('/admin/lessons');
  revalidatePath('/hub');
  return { success: true };
}

export async function publishLesson(id: string): Promise<ActionResult> {
  return updateLesson(id, { status: 'published' });
}

export async function getLessonVersions(lessonId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lesson_versions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function restoreVersion(versionId: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`restore-version-${versionId}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();

  const { data: version, error: fetchErr } = await supabase.from('lesson_versions').select('*').eq('id', versionId).single();
  if (fetchErr || !version) return { success: false, error: 'Version not found.' };

  const snapshot = version.snapshot as Record<string, unknown>;
  const lessonId = version.lesson_id;

  // Snapshot current state first
  const { data: current } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
  if (current) await snapshotVersion(lessonId, current);

  const { error: updateErr } = await supabase.from('lessons').update(snapshot).eq('id', lessonId);
  if (updateErr) return { success: false, error: updateErr.message };

  await logAdminAction('restore_version', 'lesson', lessonId, { versionId });
  revalidatePath('/admin');
  revalidatePath('/admin/lessons');
  revalidatePath('/hub');
  return { success: true };
}

export async function bulkImportLessons(rawText: string): Promise<ActionResult> {
  const slides = parseBulkImport(rawText);
  if (slides.length === 0) return { success: false, error: 'Could not parse any slides from the input text.' };
  return { success: true, data: slides };
}
