import { Router } from 'express';
import { upload } from '../config/upload.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.getProducts);

router.use(authenticate);
router.post('/', authorize('super_manager'), upload.single('image'), productController.createProduct);
router.patch('/:id', authorize('super_manager'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authorize('super_manager'), productController.deleteProduct);

export default router;
