import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(6))))'));
    table.uuid('role_id').notNullable();
    table.uuid('permission_id').notNullable();
    table.uuid('assigned_by').notNullable();
    table.timestamp('assigned_at').defaultTo(knex.fn.now());
    
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    table.foreign('assigned_by').references('id').inTable('users').onDelete('CASCADE');
    
    table.unique(['role_id', 'permission_id']);
    table.index(['role_id']);
    table.index(['permission_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('role_permissions');
}
