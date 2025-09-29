import express from 'express';
import { RBACClient, RBACMiddleware } from '../src';

const app = express();
app.use(express.json());

// Initialize RBAC client
const rbacClient = new RBACClient({
  baseUrl: 'http://localhost:3001',
  timeout: 5000
});

// Initialize RBAC middleware
const rbacMiddleware = new RBACMiddleware({
  rbacClient
});

// Public routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'My App with RBAC' });
});

// Protected routes with different permission levels
app.get('/api/profile', 
  rbacMiddleware.verifyToken, 
  (req, res) => {
    res.json({ 
      message: 'Profile accessed successfully',
      user: req.user 
    });
  }
);

app.get('/api/users', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requireUserManagement,
  (req, res) => {
    res.json({ message: 'User management accessed' });
  }
);

app.get('/api/admin', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requireAdmin,
  (req, res) => {
    res.json({ message: 'Admin area accessed' });
  }
);

app.get('/api/content', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requirePermission({ resource: 'content', action: 'read' }),
  (req, res) => {
    res.json({ message: 'Content accessed' });
  }
);

app.post('/api/content', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requirePermission({ resource: 'content', action: 'create' }),
  (req, res) => {
    res.json({ message: 'Content created' });
  }
);

// Route that requires either admin role or specific permission
app.get('/api/sensitive', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requireAdminOrPermission({ resource: 'sensitive', action: 'read' }),
  (req, res) => {
    res.json({ message: 'Sensitive data accessed' });
  }
);

// Route that requires any of multiple roles
app.get('/api/management', 
  rbacMiddleware.verifyToken,
  rbacMiddleware.requireAnyRole(['admin', 'manager']),
  (req, res) => {
    res.json({ message: 'Management area accessed' });
  }
);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 My App with RBAC running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
