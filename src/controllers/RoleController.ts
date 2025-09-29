import { Request, Response } from 'express';
import Joi from 'joi';
import { RBACService } from '../services/RBACService';

const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  isActive: Joi.boolean().default(true)
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
  isActive: Joi.boolean()
});

export class RoleController {
  constructor(private rbacService: RBACService) {}

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createRoleSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const role = await this.rbacService.createRole(value);

      res.status(201).json({
        message: 'Role criada com sucesso',
        data: {
          id: role.id,
          name: role.name,
          description: role.description,
          isActive: role.isActive,
          createdAt: role.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const roles = await this.rbacService.listRoles(limit, offset);
      const total = await this.rbacService.getRolesCount();

      res.json({
        data: roles,
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

  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await this.rbacService.getRoleById(id);

      if (!role) {
        res.status(404).json({ error: 'Role não encontrada' });
        return;
      }

      const permissions = await this.rbacService.getRolePermissions(id);

      res.json({
        data: {
          role,
          permissions
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateRoleSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const updatedRole = await this.rbacService.updateRole(id, value);
      if (!updatedRole) {
        res.status(404).json({ error: 'Role não encontrada' });
        return;
      }

      res.json({
        message: 'Role atualizada com sucesso',
        data: updatedRole
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.rbacService.deleteRole(id);

      if (!deleted) {
        res.status(404).json({ error: 'Role não encontrada' });
        return;
      }

      res.json({ message: 'Role deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async assignPermission(req: Request, res: Response): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;
      const assignedBy = req.user?.userId;

      if (!assignedBy) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const success = await this.rbacService.assignPermissionToRole(roleId, permissionId, assignedBy);
      if (!success) {
        res.status(400).json({ error: 'Erro ao atribuir permissão à role' });
        return;
      }

      res.json({ message: 'Permissão atribuída com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removePermission(req: Request, res: Response): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;
      const success = await this.rbacService.removePermissionFromRole(roleId, permissionId);

      if (!success) {
        res.status(400).json({ error: 'Erro ao remover permissão da role' });
        return;
      }

      res.json({ message: 'Permissão removida com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
