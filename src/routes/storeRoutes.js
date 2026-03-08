import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { resolveStore } from '../middlewares/resolveStore.js';
import * as storeController from '../controllers/storeController.js';
import * as storeProductController from '../controllers/storeProductController.js';

const router = Router();

// 공개 조회
router.get('/', storeController.getStores);
router.get('/:storeId/products', resolveStore, storeProductController.getStoreProducts);

// 인증 필요
router.use(authenticate);
router.post('/', authorize('super_manager'), storeController.createStore);
router.patch('/:id', authorize('super_manager'), resolveStore, storeController.updateStore);
router.delete('/:id', authorize('super_manager'), resolveStore, storeController.deleteStore);
router.patch('/:storeId/products/:productId', authorize('manager', 'super_manager'), resolveStore, storeProductController.updateStoreProduct);
router.patch('/:storeId/products/:productId/toggle-soldout', authorize('manager', 'super_manager'), resolveStore, storeProductController.toggleSoldOut);
router.patch('/:storeId/products/:productId/toggle-size', resolveStore, storeProductController.toggleSize);
router.patch('/:storeId/products/:productId/toggle-age', authorize('manager', 'super_manager'), resolveStore, storeProductController.toggleAge);

export default router;
