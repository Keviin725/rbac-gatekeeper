import { NextFunction, Request, Response } from 'express';
import { RBACService } from '../services/RBACService';
import { JWTPayload, PermissionCheck } from '../types';

/**
 * Extend Express Request interface to include user data
 * This allows access to user information in route handlers
 */
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user data from JWT token */
      user?: JWTPayload;
      /** RBAC service instance for authorization checks */
      rbacService?: RBACService;
    }
  }
}

/**
 * Authentication and Authorization Middleware
 * Provides JWT token verification and role/permission-based access control
 */
export class AuthMiddleware {
  /**
   * Creates a new AuthMiddleware instance
   * @param rbacService - RBAC service instance for authorization checks
   */
  constructor(private readonly rbacService: RBACService) {}

  /**
   * Middleware to verify JWT token
   * Extracts and validates JWT token from Authorization header
   * Sets user data in request object for subsequent middleware/handlers
   */
  verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token de acesso não fornecido' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const payload = this.rbacService.verifyToken(token);

      if (!payload) {
        res.status(401).json({ error: 'Token inválido ou expirado' });
        return;
      }

      req.user = payload;
      req.rbacService = this.rbacService;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Erro na verificação do token' });
    }
  };

  /**
   * Middleware factory to check if user has a specific role
   * @param roleName - Name of the required role
   * @returns Express middleware function
   */
  requireRole = (roleName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const hasRole = await this.rbacService.hasRole(req.user.userId, roleName);
        
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

  /**
   * Middleware factory to check if user has a specific permission
   * @param permissionCheck - Permission to check (resource and action)
   * @returns Express middleware function
   */
  requirePermission = (permissionCheck: PermissionCheck) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Usuário não autenticado' });
          return;
        }

        const hasPermission = await this.rbacService.hasPermission(
          req.user.userId, 
          permissionCheck
        );
        
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

        const hasAnyRole = await Promise.all(
          roleNames.map(roleName => this.rbacService.hasRole(req.user!.userId, roleName))
        );

        if (!hasAnyRole.some(hasRole => hasRole)) {
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

        const hasAnyPermission = await Promise.all(
          permissionChecks.map(permissionCheck => 
            this.rbacService.hasPermission(req.user!.userId, permissionCheck)
          )
        );

        if (!hasAnyPermission.some(hasPermission => hasPermission)) {
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

  // Middleware to check if user is admin (has admin role)
  requireAdmin = this.requireRole('admin');

  // Middleware to check if user can manage users
  requireUserManagement = this.requirePermission({ resource: 'users', action: 'manage' });

  // Middleware to check if user can manage roles
  requireRoleManagement = this.requirePermission({ resource: 'roles', action: 'manage' });

  // Middleware to check if user can manage permissions
  requirePermissionManagement = this.requirePermission({ resource: 'permissions', action: 'manage' });
}
