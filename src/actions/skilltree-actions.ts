'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { checkDedupe } from '@/lib/utils/rate-limit';
import { revalidatePath } from 'next/cache';

type ActionResult = { success: boolean; data?: unknown; error?: string };

export interface SkillTreeNode {
  id: string;
  title: string;
  status: string;
  difficulty: string;
  position: number;
}

export interface SkillTreeEdge {
  source: string;
  target: string;
}

export async function getSkillTree(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch lessons for this category
  const { data: lessons, error: lessonErr } = await supabase
    .from('lessons')
    .select('id, title, status, difficulty, position')
    .eq('category_id', categoryId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (lessonErr) return { success: false, error: lessonErr.message };

  const lessonIds = (lessons ?? []).map(l => l.id);

  // Fetch prerequisites for these lessons
  const { data: prereqs, error: prereqErr } = await supabase
    .from('lesson_prerequisites')
    .select('lesson_id, prerequisite_id')
    .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['__none__']);

  if (prereqErr) return { success: false, error: prereqErr.message };

  const nodes: SkillTreeNode[] = (lessons ?? []).map(l => ({
    id: l.id,
    title: l.title,
    status: l.status ?? 'draft',
    difficulty: l.difficulty ?? '',
    position: l.position ?? 0,
  }));

  const edges: SkillTreeEdge[] = (prereqs ?? []).map(p => ({
    source: p.prerequisite_id,
    target: p.lesson_id,
  }));

  return { success: true, data: { nodes, edges } };
}

export async function addPrerequisite(lessonId: string, prerequisiteId: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`add-prereq-${lessonId}-${prerequisiteId}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();

  // Self-dependency check (also enforced by DB constraint)
  if (lessonId === prerequisiteId) {
    return { success: false, error: 'A lesson cannot be its own prerequisite.' };
  }

  const supabase = await createClient();

  // Cycle detection via Postgres function
  const { data: isSafe, error: cycleErr } = await supabase.rpc('check_no_cycle', {
    p_lesson_id: lessonId,
    p_prereq_id: prerequisiteId,
  });

  if (cycleErr) return { success: false, error: cycleErr.message };
  if (!isSafe) return { success: false, error: 'Adding this prerequisite would create a circular dependency.' };

  const { error } = await supabase.from('lesson_prerequisites').insert({
    lesson_id: lessonId,
    prerequisite_id: prerequisiteId,
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'This prerequisite already exists.' };
    return { success: false, error: error.message };
  }

  // Log
  const { userId } = await requireAdmin();
  await supabase.from('admin_logs').insert({
    admin_id: userId,
    action: 'add_prerequisite',
    entity_type: 'lesson_prerequisites',
    entity_id: lessonId,
    details: { prerequisite_id: prerequisiteId },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/skill-tree');
  revalidatePath('/hub');

  return { success: true };
}

export async function removePrerequisite(lessonId: string, prerequisiteId: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`remove-prereq-${lessonId}-${prerequisiteId}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('lesson_prerequisites')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('prerequisite_id', prerequisiteId);

  if (error) return { success: false, error: error.message };

  const { userId } = await requireAdmin();
  await supabase.from('admin_logs').insert({
    admin_id: userId,
    action: 'remove_prerequisite',
    entity_type: 'lesson_prerequisites',
    entity_id: lessonId,
    details: { prerequisite_id: prerequisiteId },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/skill-tree');
  revalidatePath('/hub');

  return { success: true };
}
export async function updateLessonPosition(lessonId: string, position: number): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('lessons')
    .update({ position })
    .eq('id', lessonId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/skill-tree');
  revalidatePath('/hub');

  return { success: true };
}

export async function reorderLessons(reorders: { id: string, position: number }[]): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const results = await Promise.all(
    reorders.map(item => 
      supabase.from('lessons').update({ position: item.position }).eq('id', item.id)
    )
  );

  const error = results.find(r => r.error)?.error;
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/skill-tree');
  revalidatePath('/hub');

  return { success: true };
}
