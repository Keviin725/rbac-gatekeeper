import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('role_permissions').del();
  await knex('user_roles').del();
  await knex('permissions').del();
  await knex('roles').del();
  await knex('users').del();

  // Insert initial users
  const [adminUser] = await knex('users').insert([
    {
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      is_active: true
    },
    {
      id: 'user-1-id',
      username: 'user1',
      email: 'user1@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      is_active: true
    }
  ]).returning('*');

  // Insert initial roles
  const [adminRole, userRole, managerRole] = await knex('roles').insert([
    {
      id: 'admin-role-id',
      name: 'admin',
      description: 'Administrador do sistema',
      is_active: true
    },
    {
      id: 'user-role-id',
      name: 'user',
      description: 'Usuário comum',
      is_active: true
    },
    {
      id: 'manager-role-id',
      name: 'manager',
      description: 'Gerente',
      is_active: true
    }
  ]).returning('*');

  // Insert initial permissions
  const permissions = await knex('permissions').insert([
    // User management permissions
    {
      id: 'perm-1',
      name: 'users:create',
      resource: 'users',
      action: 'create',
      description: 'Criar usuários'
    },
    {
      id: 'perm-2',
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'Visualizar usuários'
    },
    {
      id: 'perm-3',
      name: 'users:update',
      resource: 'users',
      action: 'update',
      description: 'Atualizar usuários'
    },
    {
      id: 'perm-4',
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      description: 'Deletar usuários'
    },
    {
      id: 'perm-5',
      name: 'users:manage',
      resource: 'users',
      action: 'manage',
      description: 'Gerenciar usuários (todas as operações)'
    },
    
    // Role management permissions
    {
      id: 'perm-6',
      name: 'roles:create',
      resource: 'roles',
      action: 'create',
      description: 'Criar roles'
    },
    {
      id: 'perm-7',
      name: 'roles:read',
      resource: 'roles',
      action: 'read',
      description: 'Visualizar roles'
    },
    {
      id: 'perm-8',
      name: 'roles:update',
      resource: 'roles',
      action: 'update',
      description: 'Atualizar roles'
    },
    {
      id: 'perm-9',
      name: 'roles:delete',
      resource: 'roles',
      action: 'delete',
      description: 'Deletar roles'
    },
    {
      id: 'perm-10',
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      description: 'Gerenciar roles (todas as operações)'
    },
    
    // Permission management permissions
    {
      id: 'perm-11',
      name: 'permissions:create',
      resource: 'permissions',
      action: 'create',
      description: 'Criar permissões'
    },
    {
      id: 'perm-12',
      name: 'permissions:read',
      resource: 'permissions',
      action: 'read',
      description: 'Visualizar permissões'
    },
    {
      id: 'perm-13',
      name: 'permissions:update',
      resource: 'permissions',
      action: 'update',
      description: 'Atualizar permissões'
    },
    {
      id: 'perm-14',
      name: 'permissions:delete',
      resource: 'permissions',
      action: 'delete',
      description: 'Deletar permissões'
    },
    {
      id: 'perm-15',
      name: 'permissions:manage',
      resource: 'permissions',
      action: 'manage',
      description: 'Gerenciar permissões (todas as operações)'
    },
    
    // Content permissions
    {
      id: 'perm-16',
      name: 'content:create',
      resource: 'content',
      action: 'create',
      description: 'Criar conteúdo'
    },
    {
      id: 'perm-17',
      name: 'content:read',
      resource: 'content',
      action: 'read',
      description: 'Visualizar conteúdo'
    },
    {
      id: 'perm-18',
      name: 'content:update',
      resource: 'content',
      action: 'update',
      description: 'Atualizar conteúdo'
    },
    {
      id: 'perm-19',
      name: 'content:delete',
      resource: 'content',
      action: 'delete',
      description: 'Deletar conteúdo'
    }
  ]).returning('*');

  // Assign admin role to admin user
  await knex('user_roles').insert({
    user_id: adminUser.id,
    role_id: adminRole.id,
    assigned_by: adminUser.id
  });

  // Assign user role to regular user
  await knex('user_roles').insert({
    user_id: 'user-1-id',
    role_id: userRole.id,
    assigned_by: adminUser.id
  });

  // Assign all permissions to admin role
  for (const permission of permissions) {
    await knex('role_permissions').insert({
      role_id: adminRole.id,
      permission_id: permission.id,
      assigned_by: adminUser.id
    });
  }

  // Assign basic permissions to user role
  const basicPermissions = permissions.filter(p => 
    p.resource === 'content' && p.action === 'read'
  );
  
  for (const permission of basicPermissions) {
    await knex('role_permissions').insert({
      role_id: userRole.id,
      permission_id: permission.id,
      assigned_by: adminUser.id
    });
  }

  // Assign manager permissions to manager role
  const managerPermissions = permissions.filter(p => 
    p.resource === 'content' || 
    (p.resource === 'users' && p.action === 'read')
  );
  
  for (const permission of managerPermissions) {
    await knex('role_permissions').insert({
      role_id: managerRole.id,
      permission_id: permission.id,
      assigned_by: adminUser.id
    });
  }
}
