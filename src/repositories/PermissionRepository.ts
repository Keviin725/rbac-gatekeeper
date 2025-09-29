import { Knex } from 'knex';
import { Permission } from '../types';

export class PermissionRepository {
  constructor(private knex: Knex) {}

  async create(permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const [permission] = await this.knex('permissions')
      .insert({
        ...permissionData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return this.mapPermission(permission);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.knex('permissions')
      .where({ id })
      .first();

    return permission ? this.mapPermission(permission) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.knex('permissions')
      .where({ name })
      .first();

    return permission ? this.mapPermission(permission) : null;
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const permission = await this.knex('permissions')
      .where({ resource, action })
      .first();

    return permission ? this.mapPermission(permission) : null;
  }

  async update(id: string, permissionData: Partial<Omit<Permission, 'id' | 'createdAt'>>): Promise<Permission | null> {
    const [permission] = await this.knex('permissions')
      .where({ id })
      .update({
        ...permissionData,
        updated_at: new Date()
      })
      .returning('*');

    return permission ? this.mapPermission(permission) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.knex('permissions')
      .where({ id })
      .del();

    return deleted > 0;
  }

  async list(limit: number = 10, offset: number = 0): Promise<Permission[]> {
    const permissions = await this.knex('permissions')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return permissions.map(permission => this.mapPermission(permission));
  }

  async count(): Promise<number> {
    const result = await this.knex('permissions').count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  private mapPermission(permission: any): Permission {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at
    };
  }
}
