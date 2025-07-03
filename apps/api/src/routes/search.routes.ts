import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

export const searchRouter = Router();
const searchController = new SearchController();

// Search routes
searchRouter.get('/', searchController.search);
searchRouter.get('/filters', searchController.getFilters);