import { RBACClient } from '../src';

async function sdkUsageExample() {
  // Initialize RBAC client
const rbacClient = new RBACClient({
  baseUrl: 'http://localhost:3001',
  timeout: 5000
});

  try {
    // Health check
    console.log('Checking RBAC service health...');
    const health = await rbacClient.healthCheck();
    console.log('Health status:', health);

    // Register a new user
    console.log('\nRegistering new user...');
    const newUser = await rbacClient.register({
      username: 'jane_doe',
      email: 'jane@example.com',
      password: 'password123'
    });
    console.log('User registered:', newUser);

    // Login
    console.log('\nLogging in...');
    const authResult = await rbacClient.login('jane_doe', 'password123');
    console.log('Login successful!');
    console.log('Token:', authResult.token);
    console.log('User roles:', authResult.roles.map(r => r.name));
    console.log('User permissions:', authResult.permissions.map(p => p.name));

    const token = authResult.token;

    // Get user profile
    console.log('\nGetting user profile...');
    const profile = await rbacClient.getProfile(token);
    console.log('Profile:', profile);

    // Create a role (requires admin permissions)
    console.log('\nCreating role...');
    try {
      const newRole = await rbacClient.createRole(token, {
        name: 'editor',
        description: 'Content editor',
        isActive: true
      });
      console.log('Role created:', newRole);
    } catch (error) {
      console.log('Failed to create role (likely insufficient permissions):', error.message);
    }

    // Create a permission (requires admin permissions)
    console.log('\nCreating permission...');
    try {
      const newPermission = await rbacClient.createPermission(token, {
        name: 'posts:edit',
        resource: 'posts',
        action: 'edit',
        description: 'Edit posts'
      });
      console.log('Permission created:', newPermission);
    } catch (error) {
      console.log('Failed to create permission (likely insufficient permissions):', error.message);
    }

    // List users (requires user management permissions)
    console.log('\nListing users...');
    try {
      const users = await rbacClient.getUsers(token, 1, 10);
      console.log('Users:', users.data.length, 'found');
      console.log('Pagination:', users.pagination);
    } catch (error) {
      console.log('Failed to list users (likely insufficient permissions):', error.message);
    }

    // List roles (requires role management permissions)
    console.log('\nListing roles...');
    try {
      const roles = await rbacClient.getRoles(token, 1, 10);
      console.log('Roles:', roles.data.length, 'found');
      console.log('Pagination:', roles.pagination);
    } catch (error) {
      console.log('Failed to list roles (likely insufficient permissions):', error.message);
    }

    // List permissions (requires permission management permissions)
    console.log('\nListing permissions...');
    try {
      const permissions = await rbacClient.getPermissions(token, 1, 10);
      console.log('Permissions:', permissions.data.length, 'found');
      console.log('Pagination:', permissions.pagination);
    } catch (error) {
      console.log('Failed to list permissions (likely insufficient permissions):', error.message);
    }

    // Update profile
    console.log('\nUpdating profile...');
    const updatedProfile = await rbacClient.updateProfile(token, {
      email: 'jane.updated@example.com'
    });
    console.log('Profile updated:', updatedProfile);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
sdkUsageExample();
