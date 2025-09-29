import { Request, Response } from 'express';
import Joi from 'joi';
import { RBACService } from '../services/RBACService';

/**
 * Joi validation schemas for authentication endpoints
 */
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

/**
 * Authentication Controller
 * Handles user login, registration, and authentication-related operations
 */
export class AuthController {
  /**
   * Creates a new AuthController instance
   * @param rbacService - RBAC service instance for authentication operations
   */
  constructor(private readonly rbacService: RBACService) {}

  /**
   * Handles user login authentication
   * @param req - Express request object
   * @param res - Express response object
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { username, password } = value;
      const authResult = await this.rbacService.authenticateUser(username, password);

      if (!authResult) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      res.json({
        message: 'Login realizado com sucesso',
        data: authResult
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Handles user registration
   * @param req - Express request object
   * @param res - Express response object
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { username, email, password } = value;

      // Check if user already exists
      const existingUser = await this.rbacService.getUserById(username);
      if (existingUser) {
        res.status(409).json({ error: 'Usuário já existe' });
        return;
      }

      const user = await this.rbacService.createUser({
        username,
        email,
        password,
        isActive: true
      });

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const user = await this.rbacService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const roles = await this.rbacService.getUserRoles(req.user.userId);
      const permissions = await this.rbacService.getUserPermissions(req.user.userId);

      res.json({
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          roles,
          permissions
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const updateSchema = Joi.object({
        email: Joi.string().email(),
        password: Joi.string().min(6)
      });

      const { error, value } = updateSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const updatedUser = await this.rbacService.updateUser(req.user.userId, value);
      if (!updatedUser) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({
        message: 'Perfil atualizado com sucesso',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
