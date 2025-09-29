import { DatabaseConnection } from '../../src/database/connection';
import { RBACService } from '../../src/services/RBACService';
import { testConfig } from '../setup';

describe('RBACService', () => {
  let rbacService: RBACService;
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance(testConfig);
    const knex = dbConnection.getKnex();
    rbacService = new RBACService(knex, testConfig);
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  describe('User Management', () => {
    it('should create a user', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        isActive: true
      };

      const user = await rbacService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.username).toBe('newuser');
      expect(user.email).toBe('newuser@example.com');
      expect(user.isActive).toBe(true);
      expect(user.id).toBeDefined();
    });

    it('should authenticate a user', async () => {
      const authResult = await rbacService.authenticateUser('testuser', 'password');
      
      expect(authResult).toBeDefined();
      expect(authResult?.user.username).toBe('testuser');
      expect(authResult?.token).toBeDefined();
      expect(authResult?.roles).toBeDefined();
      expect(authResult?.permissions).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const authResult = await rbacService.authenticateUser('testuser', 'wrongpassword');
      
      expect(authResult).toBeNull();
    });
  });

  describe('Role Management', () => {
    it('should create a role', async () => {
      const roleData = {
        name: 'newrole',
        description: 'New test role',
        isActive: true
      };

      const role = await rbacService.createRole(roleData);
      
      expect(role).toBeDefined();
      expect(role.name).toBe('newrole');
      expect(role.description).toBe('New test role');
      expect(role.isActive).toBe(true);
    });

    it('should assign role to user', async () => {
      const user = await rbacService.getUserById('test-user-id');
      const role = await rbacService.getRoleById('test-role-id');
      
      if (user && role) {
        const success = await rbacService.assignRoleToUser(user.id, role.id, user.id);
        expect(success).toBe(true);
      }
    });
  });

  describe('Permission Management', () => {
    it('should create a permission', async () => {
      const permissionData = {
        name: 'new:permission',
        resource: 'new',
        action: 'permission',
        description: 'New test permission'
      };

      const permission = await rbacService.createPermission(permissionData);
      
      expect(permission).toBeDefined();
      expect(permission.name).toBe('new:permission');
      expect(permission.resource).toBe('new');
      expect(permission.action).toBe('permission');
    });

    it('should assign permission to role', async () => {
      const role = await rbacService.getRoleById('test-role-id');
      const permission = await rbacService.getPermissionById('test-permission-id');
      
      if (role && permission) {
        const success = await rbacService.assignPermissionToRole(role.id, permission.id, 'test-user-id');
        expect(success).toBe(true);
      }
    });
  });

  describe('Permission Checking', () => {
    it('should check user permissions', async () => {
      const user = await rbacService.getUserById('test-user-id');
      
      if (user) {
        const hasPermission = await rbacService.hasPermission(user.id, {
          resource: 'test',
          action: 'permission'
        });
        
        expect(hasPermission).toBe(true);
      }
    });

    it('should check user roles', async () => {
      const user = await rbacService.getUserById('test-user-id');
      
      if (user) {
        const hasRole = await rbacService.hasRole(user.id, 'testrole');
        expect(hasRole).toBe(true);
      }
    });
  });

  describe('JWT Token Management', () => {
    it('should generate and verify JWT token', async () => {
      const payload = {
        userId: 'testuser',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['testrole'],
        permissions: ['test:permission']
      };

      const token = rbacService.generateToken(payload);
      expect(token).toBeDefined();

      const verified = rbacService.verifyToken(token);
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe('testuser');
      expect(verified?.username).toBe('testuser');
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const verified = rbacService.verifyToken(invalidToken);
      expect(verified).toBeNull();
    });
  });
});
