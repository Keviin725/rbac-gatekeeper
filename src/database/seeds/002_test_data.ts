import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Check if test data already exists
  const existingUser = await knex('users').where('id', 'test-user-id').first();
  if (existingUser) {
    console.log('Test data already exists, skipping seed...');
    return;
  }

  // Deletes ALL existing entries
  await knex('role_permissions').del();
  await knex('user_roles').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('users').del();

  // Insert test users
  const [testUser] = await knex('users').insert([
    {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      is_active: true
    }
  ]).returning('*');

  // Insert test roles
  const [testRole] = await knex('roles').insert([
    {
      id: 'test-role-id',
      name: 'testrole',
      description: 'Test role',
      is_active: true
    }
  ]).returning('*');

  // Insert test permissions
  const [testPermission] = await knex('permissions').insert([
    {
      id: 'test-permission-id',
      name: 'test:permission',
      resource: 'test',
      action: 'permission',
      description: 'Test permission'
    }
  ]).returning('*');

  // Assign test role to test user
  await knex('user_roles').insert({
    user_id: testUser.id,
    role_id: testRole.id,
    assigned_by: testUser.id
  });

  // Assign test permission to test role
  await knex('role_permissions').insert({
    role_id: testRole.id,
    permission_id: testPermission.id,
    assigned_by: testUser.id
  });
}
