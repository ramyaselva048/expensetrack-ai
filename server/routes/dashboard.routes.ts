import { Router } from 'express';
import { 
  getDashboardSummary, 
  getDashboardMonthly, 
  getDashboardCategories, 
  getDashboardLocations 
} from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/summary', getDashboardSummary);
router.get('/monthly', getDashboardMonthly);
router.get('/categories', getDashboardCategories);
router.get('/locations', getDashboardLocations);

export default router;
