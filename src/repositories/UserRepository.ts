import { Knex } from 'knex';
import { User } from '../types';

/**
 * Repository for User entity operations
 * Handles all database interactions for user management
 */
export class UserRepository {
  /**
   * Creates a new UserRepository instance
   * @param knex - Knex database connection instance
   */
  constructor(private knex: Knex) {}

  /**
   * Creates a new user in the database
   * @param userData - User data without id, createdAt, and updatedAt
   * @returns Promise<User> - The created user with generated id and timestamps
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await this.knex('users')
      .insert({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        is_active: userData.isActive,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return this.mapUser(user);
  }

  /**
   * Finds a user by their unique ID
   * @param id - The user's unique identifier
   * @returns Promise<User | null> - The user if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.knex('users')
      .where({ id })
      .first();

    return user ? this.mapUser(user) : null;
  }

  /**
   * Finds a user by their username
   * @param username - The user's username
   * @returns Promise<User | null> - The user if found, null otherwise
   */
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.knex('users')
      .where({ username })
      .first();

    return user ? this.mapUser(user) : null;
  }

  /**
   * Finds a user by their email address
   * @param email - The user's email address
   * @returns Promise<User | null> - The user if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.knex('users')
      .where({ email })
      .first();

    return user ? this.mapUser(user) : null;
  }

  /**
   * Updates an existing user in the database
   * @param id - The user's unique identifier
   * @param userData - Partial user data to update
   * @returns Promise<User | null> - The updated user if found, null otherwise
   */
  async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (userData.username) updateData.username = userData.username;
    if (userData.email) updateData.email = userData.email;
    if (userData.password) updateData.password = userData.password;
    if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

    const [user] = await this.knex('users')
      .where({ id })
      .update(updateData)
      .returning('*');

    return user ? this.mapUser(user) : null;
  }

  /**
   * Deletes a user from the database
   * @param id - The user's unique identifier
   * @returns Promise<boolean> - True if user was deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await this.knex('users')
      .where({ id })
      .del();

    return deleted > 0;
  }

  /**
   * Retrieves users with pagination
   * @param limit - Maximum number of users to return (default: 10)
   * @param offset - Number of users to skip (default: 0)
   * @returns Promise<User[]> - Array of users ordered by creation date
   */
  async list(limit: number = 10, offset: number = 0): Promise<User[]> {
    const users = await this.knex('users')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');

    return users.map(user => this.mapUser(user));
  }

  /**
   * Counts the total number of users in the database
   * @returns Promise<number> - Total number of users
   */
  async count(): Promise<number> {
    const result = await this.knex('users').count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  /**
   * Maps database user record to User entity
   * Converts snake_case database fields to camelCase entity properties
   * @param user - Raw database user record
   * @returns User - Mapped User entity
   */
  private mapUser(user: any): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      isActive: Boolean(user.is_active),
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}
