import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SearchService } from '../services/search.service';
import { validateQuery } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(['all', 'projects', 'tasks', 'users']).optional().default('all'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  // Filters for task search
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export class SearchController {
  private searchService = new SearchService();

  search = [
    authenticateToken,
    validateQuery(searchQuerySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { q, type, limit, offset, ...filters } = req.query as any;

        // Parse filter arrays
        const searchFilters = {
          status: filters.status ? filters.status.split(',') : undefined,
          priority: filters.priority ? filters.priority.split(',') : undefined,
          assigneeId: filters.assigneeId,
          projectId: filters.projectId,
          dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        };

        const options = {
          limit: limit || 20,
          offset: offset || 0,
          filters: searchFilters,
        };

        let results;
        switch (type) {
          case 'projects':
            results = await this.searchService.searchProjects(q, req.user.userId, options);
            break;
          case 'tasks':
            results = await this.searchService.searchTasks(q, req.user.userId, options);
            break;
          case 'users':
            results = await this.searchService.searchUsers(q, req.user.userId, options);
            break;
          case 'all':
          default:
            results = await this.searchService.searchAll(q, req.user.userId);
            break;
        }

        res.json(results);
      } catch (error) {
        next(error);
      }
    },
  ];

  getFilters = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const filters = await this.searchService.getFilterOptions(req.user.userId);
        res.json(filters);
      } catch (error) {
        next(error);
      }
    },
  ];
}