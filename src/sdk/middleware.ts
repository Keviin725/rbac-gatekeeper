import { Request, Response, NextFunction } from 'express';
import { RBACClient } from './RBACClient';
import { JWTPayload, PermissionCheck } from '../types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      rbacClient?: RBACClient;
    }
  }
}

export interface RBACMiddlewareConfig {
  rbacClient: RBACClient;
  adminToken?: string; // Token for admin operations
}

export class RBACMiddleware {
  constructor(private config: RBACMiddlewareConfig) {}

  // Middleware to verify JWT token using RBAC service
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token de acesso não fornecido' });
        return;
      }

      const token = authHeader.substring(7);
      
      // Get user profile from RBAC service
      const profile = await this.config.rbacClient.getProfile(token);
      
      if (!profile) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
        return;
      }

      // Create JWT payload from profile
      const payload: JWTPayload = {
        userId: profile.user.id,
        username: profile.user.username,
        email: profile.user.email,
        roles: profile.roles.map(role => role.name),
        permissions: profile.permissions.map(permission => permission.name)
      };

      req.user = payload;
      req.rbacClient = this.config.rbacClient;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Erro na verificação do token' });
    }
  };

  // Middleware to check if user has specific role
  requireRole = (roleName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const hasRole = req.user.roles.includes(roleName);
        
        if (!hasRole) {
          res.status(403).json({ error: `Acesso negado. Role '${roleName}' é necessária` });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Erro na verificação de role' });
      }
    };
  };

  // Middleware to check if user has specific permission
  requirePermission = (permissionCheck: PermissionCheck) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        // Check if user has the specific permission
        const hasPermission = req.user.permissions.some(permission => {
          // This is a simplified check - in a real implementation,
          // you might want to parse the permission name to extract resource and action
          return permission === `${permissionCheck.resource}:${permissionCheck.action}` ||
                 permission === `${permissionCheck.resource}.${permissionCheck.action}`;
        });
        
        if (!hasPermission) {
          res.status(403).json({ 
            error: `Acesso negado. Permissão '${permissionCheck.action}' em '${permissionCheck.resource}' é necessária` 
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Erro na verificação de permissão' });
      }
    };
  };

  // Middleware to check if user has any of the specified roles
  requireAnyRole = (roleNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const hasAnyRole = roleNames.some(roleName => req.user!.roles.includes(roleName));

        if (!hasAnyRole) {
          res.status(403).json({ 
            error: `Acesso negado. Uma das roles é necessária: ${roleNames.join(', ')}` 
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Erro na verificação de roles' });
      }
    };
  };

  // Middleware to check if user has any of the specified permissions
  requireAnyPermission = (permissionChecks: PermissionCheck[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const hasAnyPermission = permissionChecks.some(permissionCheck => {
          return req.user!.permissions.some(permission => {
            return permission === `${permissionCheck.resource}:${permissionCheck.action}` ||
                   permission === `${permissionCheck.resource}.${permissionCheck.action}`;
          });
        });

        if (!hasAnyPermission) {
          res.status(403).json({ 
            error: 'Acesso negado. Pelo menos uma das permissões é necessária' 
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Erro na verificação de permissões' });
      }
    };
  };

  // Convenience methods
  requireAdmin = this.requireRole('admin');
  requireUserManagement = this.requirePermission({ resource: 'users', action: 'manage' });
  requireRoleManagement = this.requirePermission({ resource: 'roles', action: 'manage' });
  requirePermissionManagement = this.requirePermission({ resource: 'permissions', action: 'manage' });

  // Middleware to check if user is admin or has specific permission
  requireAdminOrPermission = (permissionCheck: PermissionCheck) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const isAdmin = req.user.roles.includes('admin');
        const hasPermission = req.user.permissions.some(permission => {
          return permission === `${permissionCheck.resource}:${permissionCheck.action}` ||
                 permission === `${permissionCheck.resource}.${permissionCheck.action}`;
        });

        if (!isAdmin && !hasPermission) {
          res.status(403).json({ 
            error: `Acesso negado. Role 'admin' ou permissão '${permissionCheck.action}' em '${permissionCheck.resource}' é necessária` 
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Erro na verificação de acesso' });
      }
    };
  };
}
