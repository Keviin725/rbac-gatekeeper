import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middleware/auth';

export function createAuthRoutes(authController: AuthController, authMiddleware: AuthMiddleware) {
  const router = Router();

  // Public routes
  router.post('/login', authController.login.bind(authController));
  router.post('/register', authController.register.bind(authController));

  // Protected routes
  router.get('/profile', authMiddleware.verifyToken, authController.getProfile.bind(authController));
  router.put('/profile', authMiddleware.verifyToken, authController.updateProfile.bind(authController));

  return router;
}
