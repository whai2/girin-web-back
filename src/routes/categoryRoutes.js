import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.getCategories);

router.use(authenticate);
router.post('/', authorize('super_manager'), categoryController.createCategory);
router.patch('/:id', authorize('super_manager'), categoryController.updateCategory);
router.delete('/:id', authorize('super_manager'), categoryController.deleteCategory);

export default router;
