// Main exports for the RBAC system
export { RBACService } from './services/RBACService';
export { AuthMiddleware } from './middleware/auth';
export { RBACClient } from './sdk/RBACClient';
export { RBACMiddleware } from './sdk/middleware';
export { DatabaseConnection } from './database/connection';

// Type exports
export type {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  JWTPayload,
  AuthResult,
  PermissionCheck,
  RBACConfig
} from './types';

// SDK exports
export type { RBACClientConfig } from './sdk/RBACClient';
export type { RBACMiddlewareConfig } from './sdk/middleware';

// Default export for easy importing
export default {
  RBACService,
  AuthMiddleware,
  RBACClient,
  RBACMiddleware,
  DatabaseConnection
};
