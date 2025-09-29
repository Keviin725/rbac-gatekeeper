import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(6))))'));
    table.string('name', 100).unique().notNullable();
    table.string('resource', 100).notNullable();
    table.string('action', 50).notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['name']);
    table.index(['resource']);
    table.index(['action']);
    table.index(['resource', 'action']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('permissions');
}
