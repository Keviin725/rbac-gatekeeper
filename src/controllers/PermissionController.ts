import { Request, Response } from 'express';
import Joi from 'joi';
import { RBACService } from '../services/RBACService';

const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  resource: Joi.string().min(2).max(100).required(),
  action: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500)
});

const updatePermissionSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  resource: Joi.string().min(2).max(100),
  action: Joi.string().min(2).max(50),
  description: Joi.string().max(500)
});

export class PermissionController {
  constructor(private rbacService: RBACService) {}

  async createPermission(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createPermissionSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const permission = await this.rbacService.createPermission(value);

      res.status(201).json({
        message: 'Permissão criada com sucesso',
        data: {
          id: permission.id,
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          createdAt: permission.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getPermissions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const permissions = await this.rbacService.listPermissions(limit, offset);
      const total = await this.rbacService.getPermissionsCount();

      res.json({
        data: permissions,
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

  async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const permission = await this.rbacService.getPermissionById(id);

      if (!permission) {
        res.status(404).json({ error: 'Permissão não encontrada' });
        return;
      }

      res.json({
        data: permission
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updatePermissionSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const updatedPermission = await this.rbacService.updatePermission(id, value);
      if (!updatedPermission) {
        res.status(404).json({ error: 'Permissão não encontrada' });
        return;
      }

      res.json({
        message: 'Permissão atualizada com sucesso',
        data: updatedPermission
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deletePermission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.rbacService.deletePermission(id);

      if (!deleted) {
        res.status(404).json({ error: 'Permissão não encontrada' });
        return;
      }

      res.json({ message: 'Permissão deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
