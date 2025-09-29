import { Knex } from 'knex';
import { Role } from '../types';

export class RoleRepository {
  constructor(private knex: Knex) {}

  async create(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const [role] = await this.knex('roles')
      .insert({
        name: roleData.name,
        description: roleData.description,
        is_active: roleData.isActive,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return this.mapRole(role);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.knex('roles')
      .where({ id })
      .first();

    return role ? this.mapRole(role) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.knex('roles')
      .where({ name })
      .first();

    return role ? this.mapRole(role) : null;
  }

  async update(id: string, roleData: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<Role | null> {
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (roleData.name) updateData.name = roleData.name;
    if (roleData.description !== undefined) updateData.description = roleData.description;
    if (roleData.isActive !== undefined) updateData.is_active = roleData.isActive;

    const [role] = await this.knex('roles')
      .where({ id })
      .update(updateData)
      .returning('*');

    return role ? this.mapRole(role) : null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.knex('roles')
      .where({ id })
      .del();

    return deleted > 0;
  }

  async list(limit: number = 10, offset: number = 0): Promise<Role[]> {
    const roles = await this.knex('roles')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return roles.map(role => this.mapRole(role));
  }

  async count(): Promise<number> {
    const result = await this.knex('roles').count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  private mapRole(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: Boolean(role.is_active),
      createdAt: role.created_at,
      updatedAt: role.updated_at
    };
  }
}
