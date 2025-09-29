import { Knex } from 'knex';
import { Permission, Role, RolePermission } from '../types';

export class RolePermissionRepository {
  constructor(private knex: Knex) {}

  async assignPermission(roleId: string, permissionId: string, assignedBy: string): Promise<boolean> {
    try {
      await this.knex('role_permissions')
        .insert({
          role_id: roleId,
          permission_id: permissionId,
          assigned_by: assignedBy,
          assigned_at: new Date()
        });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<boolean> {
    const deleted = await this.knex('role_permissions')
      .where({ role_id: roleId, permission_id: permissionId })
      .del();

    return deleted > 0;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const permissions = await this.knex('role_permissions as rp')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('rp.role_id', roleId)
      .select('p.*');

    return permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at
    }));
  }

  async getPermissionRoles(permissionId: string): Promise<Role[]> {
    const roles = await this.knex('role_permissions as rp')
      .join('roles as r', 'rp.role_id', 'r.id')
      .where('rp.permission_id', permissionId)
      .where('r.is_active', true)
      .select('r.*');

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.is_active,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    }));
  }

  async hasPermission(roleId: string, permissionName: string): Promise<boolean> {
    const result = await this.knex('role_permissions as rp')
      .join('permissions as p', 'rp.permission_id', 'p.id')
      .where('rp.role_id', roleId)
      .where('p.name', permissionName)
      .first();

    return !!result;
  }

  async getRolePermissionAssignments(roleId: string): Promise<RolePermission[]> {
    const rolePermissions = await this.knex('role_permissions')
      .where('role_id', roleId);

    return rolePermissions.map(rp => this.mapRolePermission(rp));
  }

  private mapRolePermission(rolePermission: any): RolePermission {
    return {
      id: rolePermission.id,
      roleId: rolePermission.role_id,
      permissionId: rolePermission.permission_id,
      assignedAt: rolePermission.assigned_at,
      assignedBy: rolePermission.assigned_by
    };
  }
}
