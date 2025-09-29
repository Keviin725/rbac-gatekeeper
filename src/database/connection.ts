import knex, { Knex } from 'knex';
import { RBACConfig } from '../types';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private knex: Knex;

  private constructor(config: RBACConfig) {
    this.knex = knex({
      client: this.getClient(config.database.type),
      connection: this.getConnectionConfig(config.database),
      migrations: {
        directory: './src/database/migrations',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './src/database/seeds'
      }
    });
  }

  public static getInstance(config: RBACConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  public getKnex(): Knex {
    return this.knex;
  }

  private getClient(dbType: string): string {
    switch (dbType) {
      case 'postgresql':
        return 'pg';
      case 'mysql':
        return 'mysql2';
      case 'sqlite':
      default:
        return 'sqlite3';
    }
  }

  private getConnectionConfig(dbConfig: RBACConfig['database']) {
    switch (dbConfig.type) {
      case 'postgresql':
        return {
          host: dbConfig.host || 'localhost',
          port: dbConfig.port || 5432,
          database: dbConfig.database || 'rbac_system',
          user: dbConfig.username,
          password: dbConfig.password
        };
      case 'mysql':
        return {
          host: dbConfig.host || 'localhost',
          port: dbConfig.port || 3306,
          database: dbConfig.database || 'rbac_system',
          user: dbConfig.username,
          password: dbConfig.password
        };
      case 'sqlite':
      default:
        return {
          filename: dbConfig.sqlitePath || './database.sqlite'
        };
    }
  }

  public async close(): Promise<void> {
    await this.knex.destroy();
  }
}
