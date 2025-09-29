import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(4))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(2))) || \'-\' || lower(hex(randomblob(6))))'));
    table.string('name', 100).unique().notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['name']);
    table.index(['is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('roles');
}
