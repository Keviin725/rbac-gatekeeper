import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/auth';

export function createUserRoutes(userController: UserController, authMiddleware: AuthMiddleware) {
  const router = Router();

  // All user routes require authentication
  router.use(authMiddleware.verifyToken);

  // User management routes (require user management permission)
  router.post('/', authMiddleware.requireUserManagement, userController.createUser.bind(userController));
  router.get('/', authMiddleware.requireUserManagement, userController.getUsers.bind(userController));
  router.get('/:id', authMiddleware.requireUserManagement, userController.getUserById.bind(userController));
  router.put('/:id', authMiddleware.requireUserManagement, userController.updateUser.bind(userController));
  router.delete('/:id', authMiddleware.requireUserManagement, userController.deleteUser.bind(userController));

  // Role assignment routes (require role management permission)
  router.post('/:userId/roles/:roleId', authMiddleware.requireRoleManagement, userController.assignRole.bind(userController));
  router.delete('/:userId/roles/:roleId', authMiddleware.requireRoleManagement, userController.removeRole.bind(userController));

  return router;
}
