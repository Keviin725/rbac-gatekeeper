import { Router } from 'express';
import { PermissionController } from '../controllers/PermissionController';
import { AuthMiddleware } from '../middleware/auth';

export function createPermissionRoutes(permissionController: PermissionController, authMiddleware: AuthMiddleware) {
  const router = Router();

  // All permission routes require authentication
  router.use(authMiddleware.verifyToken);

  // Permission management routes (require permission management permission)
  router.post('/', authMiddleware.requirePermissionManagement, permissionController.createPermission.bind(permissionController));
  router.get('/', authMiddleware.requirePermissionManagement, permissionController.getPermissions.bind(permissionController));
  router.get('/:id', authMiddleware.requirePermissionManagement, permissionController.getPermissionById.bind(permissionController));
  router.put('/:id', authMiddleware.requirePermissionManagement, permissionController.updatePermission.bind(permissionController));
  router.delete('/:id', authMiddleware.requirePermissionManagement, permissionController.deletePermission.bind(permissionController));

  return router;
}
