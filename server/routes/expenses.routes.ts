import { Router } from 'express';
import { 
  getExpenses, 
  getExpenseById, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  bulkDeleteExpenses 
} from '../controllers/expenses.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// All expense routes require JWT authentication
router.use(authenticateJWT);

router.get('/', getExpenses);
router.post('/', createExpense);
router.post('/bulk-delete', bulkDeleteExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
