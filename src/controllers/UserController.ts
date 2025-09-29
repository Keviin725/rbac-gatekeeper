import { Request, Response } from 'express';
import Joi from 'joi';
import { RBACService } from '../services/RBACService';

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  isActive: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  isActive: Joi.boolean()
});

export class UserController {
  constructor(private rbacService: RBACService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      // Check if user already exists
      const existingUser = await this.rbacService.getUserById(value.username);
      if (existingUser) {
        res.status(409).json({ error: 'Usuário já existe' });
        return;
      }

      const user = await this.rbacService.createUser(value);

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

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const users = await this.rbacService.listUsers(limit, offset);
      const total = await this.rbacService.getUsersCount();

      res.json({
        data: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.rbacService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const roles = await this.rbacService.getUserRoles(id);
      const permissions = await this.rbacService.getUserPermissions(id);

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

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateUserSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const updatedUser = await this.rbacService.updateUser(id, value);
      if (!updatedUser) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({
        message: 'Usuário atualizado com sucesso',
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

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.rbacService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async assignRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.params;
      const assignedBy = req.user?.userId;

      if (!assignedBy) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const success = await this.rbacService.assignRoleToUser(userId, roleId, assignedBy);
      if (!success) {
        res.status(400).json({ error: 'Erro ao atribuir role ao usuário' });
        return;
      }

      res.json({ message: 'Role atribuída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeRole(req: Request, res: Response): Promise<void> {
    try {
      const { userId, roleId } = req.params;
      const success = await this.rbacService.removeRoleFromUser(userId, roleId);

      if (!success) {
        res.status(400).json({ error: 'Erro ao remover role do usuário' });
        return;
      }

      res.json({ message: 'Role removida com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
