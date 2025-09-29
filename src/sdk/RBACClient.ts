import { Permission, Role, User } from '../types';

/**
 * Configuration interface for RBAC Client
 */
export interface RBACClientConfig {
  /** Base URL of the RBAC service */
  baseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
}

/**
 * Authentication result from RBAC service
 */
export interface AuthResult {
  /** User data without password */
  user: Omit<User, 'password'>;
  /** JWT token for subsequent requests */
  token: string;
  /** User's assigned roles */
  roles: Role[];
  /** User's assigned permissions */
  permissions: Permission[];
}

/**
 * RBAC Client SDK
 * Provides a convenient interface for interacting with the RBAC service
 */
export class RBACClient {
  private readonly config: RBACClientConfig;

  /**
   * Creates a new RBACClient instance
   * @param config - Client configuration
   */
  constructor(config: RBACClientConfig) {
    this.config = {
      timeout: 5000,
      ...config
    };
  }

  /**
   * Makes an HTTP request to the RBAC service
   * @param endpoint - API endpoint path
   * @param options - Fetch request options
   * @returns Promise<T> - Response data
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<AuthResult> {
    const response = await this.makeRequest<{ data: AuthResult }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    return response.data;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<{ id: string; username: string; email: string; isActive: boolean; createdAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; username: string; email: string; isActive: boolean; createdAt: Date } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response.data;
  }

  async getProfile(token: string): Promise<{ user: Omit<User, 'password'>; roles: Role[]; permissions: Permission[] }> {
    const response = await this.makeRequest<{ data: { user: Omit<User, 'password'>; roles: Role[]; permissions: Permission[] } }>('/api/auth/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateProfile(token: string, userData: { email?: string; password?: string }): Promise<{ id: string; username: string; email: string; isActive: boolean; updatedAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; username: string; email: string; isActive: boolean; updatedAt: Date } }>('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData)
    });
    return response.data;
  }

  // User management methods
  async createUser(token: string, userData: { username: string; email: string; password: string; isActive?: boolean }): Promise<{ id: string; username: string; email: string; isActive: boolean; createdAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; username: string; email: string; isActive: boolean; createdAt: Date } }>('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData)
    });
    return response.data;
  }

  async getUsers(token: string, page: number = 1, limit: number = 10): Promise<{ data: Omit<User, 'password'>[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const response = await this.makeRequest<{ data: Omit<User, 'password'>[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  }

  async getUserById(token: string, userId: string): Promise<{ user: Omit<User, 'password'>; roles: Role[]; permissions: Permission[] }> {
    const response = await this.makeRequest<{ data: { user: Omit<User, 'password'>; roles: Role[]; permissions: Permission[] } }>(`/api/users/${userId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateUser(token: string, userId: string, userData: { username?: string; email?: string; password?: string; isActive?: boolean }): Promise<{ id: string; username: string; email: string; isActive: boolean; updatedAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; username: string; email: string; isActive: boolean; updatedAt: Date } }>(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData)
    });
    return response.data;
  }

  async deleteUser(token: string, userId: string): Promise<void> {
    await this.makeRequest(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async assignRoleToUser(token: string, userId: string, roleId: string): Promise<void> {
    await this.makeRequest(`/api/users/${userId}/roles/${roleId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async removeRoleFromUser(token: string, userId: string, roleId: string): Promise<void> {
    await this.makeRequest(`/api/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Role management methods
  async createRole(token: string, roleData: { name: string; description?: string; isActive?: boolean }): Promise<{ id: string; name: string; description?: string; isActive: boolean; createdAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; name: string; description?: string; isActive: boolean; createdAt: Date } }>('/api/roles', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(roleData)
    });
    return response.data;
  }

  async getRoles(token: string, page: number = 1, limit: number = 10): Promise<{ data: Role[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const response = await this.makeRequest<{ data: Role[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/roles?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  }

  async getRoleById(token: string, roleId: string): Promise<{ role: Role; permissions: Permission[] }> {
    const response = await this.makeRequest<{ data: { role: Role; permissions: Permission[] } }>(`/api/roles/${roleId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateRole(token: string, roleId: string, roleData: { name?: string; description?: string; isActive?: boolean }): Promise<Role> {
    const response = await this.makeRequest<{ data: Role }>(`/api/roles/${roleId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(roleData)
    });
    return response.data;
  }

  async deleteRole(token: string, roleId: string): Promise<void> {
    await this.makeRequest(`/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async assignPermissionToRole(token: string, roleId: string, permissionId: string): Promise<void> {
    await this.makeRequest(`/api/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async removePermissionFromRole(token: string, roleId: string, permissionId: string): Promise<void> {
    await this.makeRequest(`/api/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Permission management methods
  async createPermission(token: string, permissionData: { name: string; resource: string; action: string; description?: string }): Promise<{ id: string; name: string; resource: string; action: string; description?: string; createdAt: Date }> {
    const response = await this.makeRequest<{ data: { id: string; name: string; resource: string; action: string; description?: string; createdAt: Date } }>('/api/permissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(permissionData)
    });
    return response.data;
  }

  async getPermissions(token: string, page: number = 1, limit: number = 10): Promise<{ data: Permission[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const response = await this.makeRequest<{ data: Permission[]; pagination: { page: number; limit: number; total: number; pages: number } }>(`/api/permissions?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response;
  }

  async getPermissionById(token: string, permissionId: string): Promise<Permission> {
    const response = await this.makeRequest<{ data: Permission }>(`/api/permissions/${permissionId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updatePermission(token: string, permissionId: string, permissionData: { name?: string; resource?: string; action?: string; description?: string }): Promise<Permission> {
    const response = await this.makeRequest<{ data: Permission }>(`/api/permissions/${permissionId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(permissionData)
    });
    return response.data;
  }

  async deletePermission(token: string, permissionId: string): Promise<void> {
    await this.makeRequest(`/api/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return this.makeRequest('/health');
  }
}
