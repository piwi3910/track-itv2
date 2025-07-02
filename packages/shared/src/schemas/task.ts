import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const statusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  projectId: z.string().cuid(),
  categoryId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  actualHours: z.number().positive().optional(),
  position: z.number().int().nonnegative().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;