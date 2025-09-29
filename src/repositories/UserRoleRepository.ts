import { Knex } from 'knex';
import { Role, User, UserRole } from '../types';

export class UserRoleRepository {
  constructor(private knex: Knex) {}

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    try {
      await this.knex('user_roles')
        .insert({
          user_id: userId,
          role_id: roleId,
          assigned_by: assignedBy,
          assigned_at: new Date()
        });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeRole(userId: string, roleId: string): Promise<boolean> {
    const deleted = await this.knex('user_roles')
      .where({ user_id: userId, role_id: roleId })
      .del();

    return deleted > 0;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const roles = await this.knex('user_roles as ur')
      .join('roles as r', 'ur.role_id', 'r.id')
      .where('ur.user_id', userId)
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

  async getRoleUsers(roleId: string): Promise<User[]> {
    const users = await this.knex('user_roles as ur')
      .join('users as u', 'ur.user_id', 'u.id')
      .where('ur.role_id', roleId)
      .where('u.is_active', true)
      .select('u.*');

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const result = await this.knex('user_roles as ur')
      .join('roles as r', 'ur.role_id', 'r.id')
      .where('ur.user_id', userId)
      .where('r.name', roleName)
      .where('r.is_active', true)
      .first();

    return !!result;
  }

  async getUserRoleAssignments(userId: string): Promise<UserRole[]> {
    const userRoles = await this.knex('user_roles')
      .where('user_id', userId);

    return userRoles.map(ur => this.mapUserRole(ur));
  }

  private mapUserRole(userRole: any): UserRole {
    return {
      id: userRole.id,
      userId: userRole.user_id,
      roleId: userRole.role_id,
      assignedAt: userRole.assigned_at,
      assignedBy: userRole.assigned_by
    };
  }
}
