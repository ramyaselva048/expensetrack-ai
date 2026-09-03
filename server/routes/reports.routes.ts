import { Router } from 'express';
import { 
  getExpensesReport, 
  getLocationComparison, 
  getCategoryAnalysis 
} from '../controllers/reports.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/expenses', getExpensesReport);
router.get('/location-comparison', getLocationComparison);
router.get('/category-analysis', getCategoryAnalysis);

export default router;
