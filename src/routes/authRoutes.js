import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

export default router;
