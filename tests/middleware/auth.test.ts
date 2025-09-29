import { NextFunction, Request, Response } from 'express';
import { DatabaseConnection } from '../../src/database/connection';
import { AuthMiddleware } from '../../src/middleware/auth';
import { RBACService } from '../../src/services/RBACService';
import { testConfig } from '../setup';

describe('AuthMiddleware', () => {
  let rbacService: RBACService;
  let authMiddleware: AuthMiddleware;
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance(testConfig);
    const knex = dbConnection.getKnex();
    rbacService = new RBACService(knex, testConfig);
    authMiddleware = new AuthMiddleware(rbacService);
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const payload = {
        userId: 'testuser',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['testrole'],
        permissions: ['test:permission']
      };

      const token = rbacService.generateToken(payload);
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await authMiddleware.verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe('testuser');
    });

    it('should reject request without token', async () => {
      const req = {
        headers: {}
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await authMiddleware.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token de acesso não fornecido' });
    });

    it('should reject invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid.token.here'
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await authMiddleware.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' });
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', async () => {
      // Mock the hasRole method to return true
      jest.spyOn(rbacService, 'hasRole').mockResolvedValue(true);

      const req = {
        user: {
          userId: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['testrole'],
          permissions: ['test:permission']
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authMiddleware.requireRole('testrole');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required role', async () => {
      // Mock the hasRole method to return false
      jest.spyOn(rbacService, 'hasRole').mockResolvedValue(false);

      const req = {
        user: {
          userId: 'testuser',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['otherrole'],
          permissions: ['test:permission']
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authMiddleware.requireRole('testrole');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado. Role 'testrole' é necessária" });
    });
  });

  describe('requirePermission', () => {
    it('should allow access for user with required permission', async () => {
      // Mock the hasPermission method to return true
      jest.spyOn(rbacService, 'hasPermission').mockResolvedValue(true);

      const req = {
        user: {
          userId: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['testrole'],
          permissions: ['test:permission']
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authMiddleware.requirePermission({ resource: 'test', action: 'permission' });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for user without required permission', async () => {
      // Mock the hasPermission method to return false
      jest.spyOn(rbacService, 'hasPermission').mockResolvedValue(false);

      const req = {
        user: {
          userId: 'testuser',
          username: 'testuser',
          email: 'test@example.com',
          roles: ['testrole'],
          permissions: ['other:permission']
        }
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authMiddleware.requirePermission({ resource: 'test', action: 'permission' });
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: "Acesso negado. Permissão 'permission' em 'test' é necessária" 
      });
    });
  });
});
