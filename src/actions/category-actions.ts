'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/utils/admin-guard';
import { checkDedupe } from '@/lib/utils/rate-limit';
import { categoryCreateSchema, categoryUpdateSchema } from '@/lib/validators/category';
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

export async function getCategories(includeDeleted = false): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase.from('categories').select('*').order('created_at', { ascending: false });
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }
  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const dedup = await checkDedupe(`create-category-${formData.get('name')}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    theme_color: formData.get('theme_color') as string,
  };

  const parsed = categoryCreateSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').insert(parsed.data).select().single();

  if (error) return { success: false, error: error.message };

  await logAdminAction('create', 'category', data.id, parsed.data);
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
  revalidatePath('/hub');

  return { success: true, data };
}

export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const id = formData.get('id') as string;
  const dedup = await checkDedupe(`update-category-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const raw = {
    id,
    name: formData.get('name') as string || undefined,
    description: formData.get('description') as string || undefined,
    theme_color: formData.get('theme_color') as string || undefined,
  };

  const parsed = categoryUpdateSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { id: catId, ...updates } = parsed.data;
  const { data, error } = await supabase.from('categories').update(updates).eq('id', catId).select().single();

  if (error) return { success: false, error: error.message };

  await logAdminAction('update', 'category', catId, updates);
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
  revalidatePath('/hub');

  return { success: true, data };
}

export async function softDeleteCategory(id: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`delete-category-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('categories').update({ deleted_at: new Date().toISOString() }).eq('id', id);

  if (error) return { success: false, error: error.message };

  await logAdminAction('soft_delete', 'category', id);
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
  revalidatePath('/hub');

  return { success: true };
}

export async function restoreCategory(id: string): Promise<ActionResult> {
  const dedup = await checkDedupe(`restore-category-${id}`);
  if (!dedup.allowed) return { success: false, error: dedup.error };

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('categories').update({ deleted_at: null }).eq('id', id);

  if (error) return { success: false, error: error.message };

  await logAdminAction('restore', 'category', id);
  revalidatePath('/admin');
  revalidatePath('/admin/categories');
  revalidatePath('/hub');

  return { success: true };
}
