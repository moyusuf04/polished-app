import { z } from 'zod';

const slideSchema = z.object({
  type: z.enum(['context', 'insight', 'significance', 'custom']),
  title: z.string().trim().max(100, 'Slide title must be 100 characters or less').optional(),
  text: z.string().trim().min(10, 'Slide text must be at least 10 characters').max(1000, 'Slide text must be 1000 characters or less'),
});

export const lessonCreateSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120, 'Title must be 120 characters or less'),
  category_id: z.string().min(1, 'Select a primary category'),
  category_ids: z.array(z.string()).optional(),
  difficulty: z.enum(['Level 1: Foundation', 'Level 2: Intermediate', 'Level 3: Advanced']),
  description: z.string().trim().max(300, 'Description must be 300 characters or less').optional(),
  content_slides: z.array(slideSchema).min(1, 'At least one slide is required'),
  reflection_prompt: z.string().trim().min(10, 'Reflection prompt must be at least 10 characters').max(500).optional(),
  convo_hooks: z.array(z.string().trim().min(5).max(300)).max(5).optional(),
  duration: z.string().optional().or(z.literal('')),
  format: z.string().optional().or(z.literal('')),
  xp_reward: z.number().int().min(0).optional().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
  cover_image_url: z.string().url().optional().or(z.literal('')),
});

export const lessonUpdateSchema = lessonCreateSchema.partial().extend({
  id: z.string(),
});

export type SlideData = z.infer<typeof slideSchema>;
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;

/**
 * Parse structured bulk import text into slide array.
 * Expected format:
 *   Context: ...text...
 *   Insight: ...text...
 *   Significance: ...text...
 */
export function parseBulkImport(raw: string): SlideData[] {
  const slides: SlideData[] = [];
  const sections = raw.split(/\n(?=Context:|Insight:|Significance:|Setup:|Rule Break:|Why It Mattered:)/i);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    let type: SlideData['type'] = 'custom';
    let text = trimmed;

    if (/^Context:/i.test(trimmed)) {
      type = 'context';
      text = trimmed.replace(/^Context:\s*/i, '');
    } else if (/^Insight:/i.test(trimmed)) {
      type = 'insight';
      text = trimmed.replace(/^Insight:\s*/i, '');
    } else if (/^Significance:/i.test(trimmed)) {
      type = 'significance';
      text = trimmed.replace(/^Significance:\s*/i, '');
    } else if (/^Setup:/i.test(trimmed)) {
      type = 'context';
      text = trimmed.replace(/^Setup:\s*/i, '');
    } else if (/^Rule Break:/i.test(trimmed)) {
      type = 'insight';
      text = trimmed.replace(/^Rule Break:\s*/i, '');
    } else if (/^Why It Mattered:/i.test(trimmed)) {
      type = 'significance';
      text = trimmed.replace(/^Why It Mattered:\s*/i, '');
    }

    if (text.trim().length >= 10) {
      slides.push({ type, text: text.trim() });
    }
  }

  return slides;
}

/** Generate a URL-safe slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}
