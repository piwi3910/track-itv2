import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics.service';
import { validateQuery, validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const projectIdParamSchema = z.object({
  projectId: z.string().cuid(),
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  days: z.string().transform(Number).pipe(z.number().min(1).max(365)).optional(),
});

export class AnalyticsController {
  private analyticsService = new AnalyticsService();

  getProjectMetrics = [
    authenticateToken,
    validateParams(projectIdParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { projectId } = req.params;
        const metrics = await this.analyticsService.getProjectMetrics(projectId, req.user.userId);
        res.json(metrics);
      } catch (error) {
        next(error);
      }
    },
  ];

  getTaskVelocity = [
    authenticateToken,
    validateParams(projectIdParamSchema),
    validateQuery(dateRangeSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { projectId } = req.params;
        const { startDate, endDate, days } = req.query as any;

        let range;
        if (startDate && endDate) {
          range = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          };
        } else {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - (days || 30));
          range = { startDate: start, endDate: end };
        }

        const velocity = await this.analyticsService.getTaskVelocity(
          projectId,
          req.user.userId,
          range
        );
        res.json(velocity);
      } catch (error) {
        next(error);
      }
    },
  ];

  getBurndownChart = [
    authenticateToken,
    validateParams(projectIdParamSchema),
    validateQuery(dateRangeSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { projectId } = req.params;
        const { startDate, endDate, days } = req.query as any;

        let range;
        if (startDate && endDate) {
          range = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          };
        } else {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - (days || 30));
          range = { startDate: start, endDate: end };
        }

        const burndown = await this.analyticsService.getBurndownChart(
          projectId,
          req.user.userId,
          range
        );
        res.json(burndown);
      } catch (error) {
        next(error);
      }
    },
  ];

  getTeamProductivity = [
    authenticateToken,
    validateParams(projectIdParamSchema),
    validateQuery(dateRangeSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { projectId } = req.params;
        const { startDate, endDate, days } = req.query as any;

        let range;
        if (startDate && endDate) {
          range = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          };
        } else {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - (days || 30));
          range = { startDate: start, endDate: end };
        }

        const productivity = await this.analyticsService.getTeamProductivity(
          projectId,
          req.user.userId,
          range
        );
        res.json(productivity);
      } catch (error) {
        next(error);
      }
    },
  ];

  getProjectTimeline = [
    authenticateToken,
    validateParams(projectIdParamSchema),
    validateQuery(dateRangeSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { projectId } = req.params;
        const { days } = req.query as any;

        const timeline = await this.analyticsService.getProjectTimeline(
          projectId,
          req.user.userId,
          days || 30
        );
        res.json(timeline);
      } catch (error) {
        next(error);
      }
    },
  ];
}