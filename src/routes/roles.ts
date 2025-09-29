import { Router } from 'express';
import { RoleController } from '../controllers/RoleController';
import { AuthMiddleware } from '../middleware/auth';

export function createRoleRoutes(roleController: RoleController, authMiddleware: AuthMiddleware) {
  const router = Router();

  // All role routes require authentication
  router.use(authMiddleware.verifyToken);

  // Role management routes (require role management permission)
  router.post('/', authMiddleware.requireRoleManagement, roleController.createRole.bind(roleController));
  router.get('/', authMiddleware.requireRoleManagement, roleController.getRoles.bind(roleController));
  router.get('/:id', authMiddleware.requireRoleManagement, roleController.getRoleById.bind(roleController));
  router.put('/:id', authMiddleware.requireRoleManagement, roleController.updateRole.bind(roleController));
  router.delete('/:id', authMiddleware.requireRoleManagement, roleController.deleteRole.bind(roleController));

  // Permission assignment routes (require permission management permission)
  router.post('/:roleId/permissions/:permissionId', authMiddleware.requirePermissionManagement, roleController.assignPermission.bind(roleController));
  router.delete('/:roleId/permissions/:permissionId', authMiddleware.requirePermissionManagement, roleController.removePermission.bind(roleController));

  return router;
}
