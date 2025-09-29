import { DatabaseConnection } from '../src/database/connection';
import { RBACConfig } from '../src/types';

// Test configuration
export const testConfig: RBACConfig = {
  database: {
    type: 'sqlite',
    sqlitePath: './test.sqlite'
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h'
  }
};

// Global test setup
beforeAll(async () => {
  // Initialize test database
  const dbConnection = DatabaseConnection.getInstance(testConfig);
  const knex = dbConnection.getKnex();
  
  // Run migrations
  await knex.migrate.latest();
  
  // Run only test seeds
  await knex.seed.run({ specific: '002_test_data.ts' });
}, 30000);

afterAll(async () => {
  // Cleanup
  const dbConnection = DatabaseConnection.getInstance(testConfig);
  await dbConnection.close();
});
