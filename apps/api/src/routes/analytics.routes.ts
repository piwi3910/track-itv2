import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

export const analyticsRouter = Router();
const analyticsController = new AnalyticsController();

// Analytics routes
analyticsRouter.get('/projects/:projectId/metrics', analyticsController.getProjectMetrics);
analyticsRouter.get('/projects/:projectId/velocity', analyticsController.getTaskVelocity);
analyticsRouter.get('/projects/:projectId/burndown', analyticsController.getBurndownChart);
analyticsRouter.get('/projects/:projectId/productivity', analyticsController.getTeamProductivity);
analyticsRouter.get('/projects/:projectId/timeline', analyticsController.getProjectTimeline);