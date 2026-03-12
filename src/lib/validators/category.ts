import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name must be 50 characters or less'),
  description: z.string().trim().max(200, 'Description must be 200 characters or less').optional(),
  theme_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
