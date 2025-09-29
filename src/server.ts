import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { AuthController } from './controllers/AuthController';
import { PermissionController } from './controllers/PermissionController';
import { RoleController } from './controllers/RoleController';
import { UserController } from './controllers/UserController';
import { DatabaseConnection } from './database/connection';
import { AuthMiddleware } from './middleware/auth';
import { createAuthRoutes } from './routes/auth';
import { createPermissionRoutes } from './routes/permissions';
import { createRoleRoutes } from './routes/roles';
import { createUserRoutes } from './routes/users';
import { RBACService } from './services/RBACService';
import { RBACConfig } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database configuration
const config: RBACConfig = {
  database: {
    type: (process.env.DB_TYPE as 'sqlite' | 'postgresql' | 'mysql') || 'sqlite',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    sqlitePath: process.env.SQLITE_PATH || './database.sqlite'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

// Initialize database connection
const dbConnection = DatabaseConnection.getInstance(config);
const knex = dbConnection.getKnex();

// Initialize services
const rbacService = new RBACService(knex, config);
const authMiddleware = new AuthMiddleware(rbacService);

// Initialize controllers
const authController = new AuthController(rbacService);
const userController = new UserController(rbacService);
const roleController = new RoleController(rbacService);
const permissionController = new PermissionController(rbacService);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'RBAC System'
  });
});

// API routes
app.use('/api/auth', createAuthRoutes(authController, authMiddleware));
app.use('/api/users', createUserRoutes(userController, authMiddleware));
app.use('/api/roles', createRoleRoutes(roleController, authMiddleware));
app.use('/api/permissions', createPermissionRoutes(permissionController, authMiddleware));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor RBAC rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Banco de dados: ${config.database.type}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await dbConnection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await dbConnection.close();
  process.exit(0);
});

export { app, authMiddleware, rbacService };

