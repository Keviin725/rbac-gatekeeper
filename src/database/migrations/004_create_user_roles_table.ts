import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(6))))'));
    table.uuid('user_id').notNullable();
    table.uuid('role_id').notNullable();
    table.uuid('assigned_by').notNullable();
    table.timestamp('assigned_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
    table.foreign('assigned_by').references('id').inTable('users').onDelete('CASCADE');
    
    table.unique(['user_id', 'role_id']);
    table.index(['user_id']);
    table.index(['role_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_roles');
}
