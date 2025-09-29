import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Knex } from 'knex';
import { PermissionRepository } from '../repositories/PermissionRepository';
import { RolePermissionRepository } from '../repositories/RolePermissionRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { UserRepository } from '../repositories/UserRepository';
import { UserRoleRepository } from '../repositories/UserRoleRepository';
import { AuthResult, JWTPayload, Permission, PermissionCheck, RBACConfig, Role, User } from '../types';

/**
 * Core RBAC (Role-Based Access Control) Service
 * Handles all business logic for user authentication, authorization, and role/permission management
 */
export class RBACService {
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;
  private readonly permissionRepository: PermissionRepository;
  private readonly userRoleRepository: UserRoleRepository;
  private readonly rolePermissionRepository: RolePermissionRepository;

  /**
   * Creates a new RBACService instance
   * @param knex - Knex database connection instance
   * @param config - RBAC system configuration
   */
  constructor(private readonly knex: Knex, private readonly config: RBACConfig) {
    this.userRepository = new UserRepository(knex);
    this.roleRepository = new RoleRepository(knex);
    this.permissionRepository = new PermissionRepository(knex);
    this.userRoleRepository = new UserRoleRepository(knex);
    this.rolePermissionRepository = new RolePermissionRepository(knex);
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Creates a new user with hashed password
   * @param userData - User data without id, createdAt, updatedAt
   * @returns Promise<User> - The created user with hashed password
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
  }

  /**
   * Authenticates a user with username and password
   * @param username - User's username
   * @param password - User's plain text password
   * @returns Promise<AuthResult | null> - Authentication result with user data and JWT token, or null if invalid
   */
  async authenticateUser(username: string, password: string): Promise<AuthResult | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    const roles = await this.userRoleRepository.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map(role => role.name),
      permissions: permissions.map(permission => permission.name)
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token,
      roles,
      permissions
    };
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  // Role Management
  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    return this.roleRepository.create(roleData);
  }

  async getRoleById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<Role | null> {
    return this.roleRepository.update(id, roleData);
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roleRepository.delete(id);
  }

  // Permission Management
  async createPermission(permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    return this.permissionRepository.create(permissionData);
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }

  async updatePermission(id: string, permissionData: Partial<Omit<Permission, 'id' | 'createdAt'>>): Promise<Permission | null> {
    return this.permissionRepository.update(id, permissionData);
  }

  async deletePermission(id: string): Promise<boolean> {
    return this.permissionRepository.delete(id);
  }

  // User-Role Management
  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      await this.userRoleRepository.assignRole(userId, roleId, assignedBy);
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    return this.userRoleRepository.removeRole(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.userRoleRepository.getUserRoles(userId);
  }

  // Role-Permission Management
  async assignPermissionToRole(roleId: string, permissionId: string, assignedBy: string): Promise<boolean> {
    try {
      await this.rolePermissionRepository.assignPermission(roleId, permissionId, assignedBy);
      return true;
    } catch (error) {
      return false;
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    return this.rolePermissionRepository.removePermission(roleId, permissionId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.rolePermissionRepository.getRolePermissions(roleId);
  }

  // Permission Checking
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.userRoleRepository.getUserRoles(userId);
    const allPermissions: Permission[] = [];

    for (const role of userRoles) {
      const rolePermissions = await this.rolePermissionRepository.getRolePermissions(role.id);
      allPermissions.push(...rolePermissions);
    }

    // Remove duplicates
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }

  /**
   * Checks if a user has a specific permission
   * @param userId - The user's unique identifier
   * @param permissionCheck - Permission to check (resource and action)
   * @returns Promise<boolean> - True if user has the permission, false otherwise
   * @note Admin users automatically have all permissions
   */
  async hasPermission(userId: string, permissionCheck: PermissionCheck): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(permission =>
      permission.resource === permissionCheck.resource &&
      permission.action === permissionCheck.action
    );
  }

  /**
   * Checks if a user has a specific role
   * @param userId - The user's unique identifier
   * @param roleName - Name of the role to check
   * @returns Promise<boolean> - True if user has the role, false otherwise
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    return this.userRoleRepository.hasRole(userId, roleName);
  }

  // ==================== JWT TOKEN MANAGEMENT ====================

  /**
   * Generates a JWT token for a user
   * @param payload - JWT payload data (without iat and exp)
   * @returns string - Signed JWT token
   */
  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresIn
    } as jwt.SignOptions);
  }

  /**
   * Verifies and decodes a JWT token
   * @param token - JWT token to verify
   * @returns JWTPayload | null - Decoded payload if valid, null if invalid or expired
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.config.jwt.secret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Utility Methods
  async listUsers(limit: number = 10, offset: number = 0): Promise<User[]> {
    return this.userRepository.list(limit, offset);
  }

  async listRoles(limit: number = 10, offset: number = 0): Promise<Role[]> {
    return this.roleRepository.list(limit, offset);
  }

  async listPermissions(limit: number = 10, offset: number = 0): Promise<Permission[]> {
    return this.permissionRepository.list(limit, offset);
  }

  async getUsersCount(): Promise<number> {
    return this.userRepository.count();
  }

  async getRolesCount(): Promise<number> {
    return this.roleRepository.count();
  }

  async getPermissionsCount(): Promise<number> {
    return this.permissionRepository.count();
  }
}
