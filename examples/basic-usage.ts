import { RBACService, DatabaseConnection, RBACConfig } from '../src';

// Configuration
const config: RBACConfig = {
  database: {
    type: 'sqlite',
    sqlitePath: './example.sqlite'
  },
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '24h'
  }
};

async function basicUsageExample() {
  // Initialize database connection
  const dbConnection = DatabaseConnection.getInstance(config);
  const knex = dbConnection.getKnex();

  // Initialize RBAC service
  const rbacService = new RBACService(knex, config);

  try {
    // Create a user
    console.log('Creating user...');
    const user = await rbacService.createUser({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      isActive: true
    });
    console.log('User created:', user.id);

    // Create roles
    console.log('Creating roles...');
    const adminRole = await rbacService.createRole({
      name: 'admin',
      description: 'System administrator',
      isActive: true
    });

    const userRole = await rbacService.createRole({
      name: 'user',
      description: 'Regular user',
      isActive: true
    });

    // Create permissions
    console.log('Creating permissions...');
    const userManagePermission = await rbacService.createPermission({
      name: 'users:manage',
      resource: 'users',
      action: 'manage',
      description: 'Manage users'
    });

    const contentReadPermission = await rbacService.createPermission({
      name: 'content:read',
      resource: 'content',
      action: 'read',
      description: 'Read content'
    });

    // Assign role to user
    console.log('Assigning role to user...');
    await rbacService.assignRoleToUser(user.id, adminRole.id, user.id);

    // Assign permissions to role
    console.log('Assigning permissions to role...');
    await rbacService.assignPermissionToRole(adminRole.id, userManagePermission.id, user.id);
    await rbacService.assignPermissionToRole(userRole.id, contentReadPermission.id, user.id);

    // Authenticate user
    console.log('Authenticating user...');
    const authResult = await rbacService.authenticateUser('john_doe', 'password123');
    if (authResult) {
      console.log('Authentication successful!');
      console.log('Token:', authResult.token);
      console.log('User roles:', authResult.roles.map(r => r.name));
      console.log('User permissions:', authResult.permissions.map(p => p.name));
    }

    // Check permissions
    console.log('Checking permissions...');
    const hasUserManagePermission = await rbacService.hasPermission(user.id, {
      resource: 'users',
      action: 'manage'
    });
    console.log('Has user manage permission:', hasUserManagePermission);

    const hasAdminRole = await rbacService.hasRole(user.id, 'admin');
    console.log('Has admin role:', hasAdminRole);

    // Get user permissions
    const userPermissions = await rbacService.getUserPermissions(user.id);
    console.log('All user permissions:', userPermissions.map(p => `${p.resource}:${p.action}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close database connection
    await dbConnection.close();
  }
}

// Run the example
basicUsageExample();
