/**
 * Core domain entities for RBAC system
 */

/**
 * User entity representing a system user
 * @interface User
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Unique username for authentication */
  username: string;
  /** Unique email address */
  email: string;
  /** Hashed password (never store plain text) */
  password: string;
  /** Whether the user account is active */
  isActive: boolean;
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the user was last updated */
  updatedAt: Date;
}

/**
 * Role entity representing a user role
 * @interface Role
 */
export interface Role {
  /** Unique identifier for the role */
  id: string;
  /** Unique role name (e.g., 'admin', 'user', 'manager') */
  name: string;
  /** Optional description of the role's purpose */
  description?: string;
  /** Whether the role is currently active */
  isActive: boolean;
  /** Timestamp when the role was created */
  createdAt: Date;
  /** Timestamp when the role was last updated */
  updatedAt: Date;
}

/**
 * Permission entity representing a specific permission
 * @interface Permission
 */
export interface Permission {
  /** Unique identifier for the permission */
  id: string;
  /** Permission name in format 'resource:action' (e.g., 'users:create') */
  name: string;
  /** Resource being accessed (e.g., 'users', 'posts', 'settings') */
  resource: string;
  /** Action being performed (e.g., 'create', 'read', 'update', 'delete') */
  action: string;
  /** Optional description of what this permission allows */
  description?: string;
  /** Timestamp when the permission was created */
  createdAt: Date;
  /** Timestamp when the permission was last updated */
  updatedAt: Date;
}

/**
 * Junction table entity for user-role relationships
 * @interface UserRole
 */
export interface UserRole {
  /** Unique identifier for the assignment */
  id: string;
  /** ID of the user being assigned the role */
  userId: string;
  /** ID of the role being assigned */
  roleId: string;
  /** Timestamp when the role was assigned */
  assignedAt: Date;
  /** ID of the user who made the assignment */
  assignedBy: string;
}

/**
 * Junction table entity for role-permission relationships
 * @interface RolePermission
 */
export interface RolePermission {
  /** Unique identifier for the assignment */
  id: string;
  /** ID of the role being assigned the permission */
  roleId: string;
  /** ID of the permission being assigned */
  permissionId: string;
  /** Timestamp when the permission was assigned */
  assignedAt: Date;
  /** ID of the user who made the assignment */
  assignedBy: string;
}

/**
 * JWT token payload structure
 * @interface JWTPayload
 */
export interface JWTPayload {
  /** ID of the authenticated user */
  userId: string;
  /** Username of the authenticated user */
  username: string;
  /** Email of the authenticated user */
  email: string;
  /** Array of role names the user has */
  roles: string[];
  /** Array of permission names the user has */
  permissions: string[];
  /** Token issued at timestamp (JWT standard) */
  iat?: number;
  /** Token expiration timestamp (JWT standard) */
  exp?: number;
}

/**
 * Authentication result containing user data and token
 * @interface AuthResult
 */
export interface AuthResult {
  /** User data without sensitive password field */
  user: Omit<User, 'password'>;
  /** JWT token for subsequent requests */
  token: string;
  /** Array of roles assigned to the user */
  roles: Role[];
  /** Array of permissions assigned to the user */
  permissions: Permission[];
}

/**
 * Permission check request structure
 * @interface PermissionCheck
 */
export interface PermissionCheck {
  /** Resource being accessed */
  resource: string;
  /** Action being performed */
  action: string;
}

/**
 * RBAC system configuration
 * @interface RBACConfig
 */
export interface RBACConfig {
  /** Database configuration */
  database: {
    /** Database type */
    type: 'sqlite' | 'postgresql' | 'mysql';
    /** Database host (for PostgreSQL/MySQL) */
    host?: string;
    /** Database port (for PostgreSQL/MySQL) */
    port?: number;
    /** Database name (for PostgreSQL/MySQL) */
    database?: string;
    /** Database username (for PostgreSQL/MySQL) */
    username?: string;
    /** Database password (for PostgreSQL/MySQL) */
    password?: string;
    /** SQLite database file path (for SQLite) */
    sqlitePath?: string;
  };
  /** JWT configuration */
  jwt: {
    /** Secret key for signing JWT tokens */
    secret: string;
    /** Token expiration time (e.g., '24h', '7d') */
    expiresIn: string;
  };
}
