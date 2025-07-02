import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;