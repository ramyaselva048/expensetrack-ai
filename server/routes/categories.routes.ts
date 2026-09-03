import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categories.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getCategories);
router.post('/', createCategory);

export default router;
