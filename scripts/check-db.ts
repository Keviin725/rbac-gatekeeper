import { DatabaseConnection } from '../src/database/connection';
import { testConfig } from '../tests/setup';

async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco de teste...');
  
  const dbConnection = DatabaseConnection.getInstance(testConfig);
  const knex = dbConnection.getKnex();
  
  try {
    // Verificar se as tabelas existem
    const tables = await knex.raw("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tabelas encontradas:', tables);
    
    // Verificar estrutura da tabela users
    const usersSchema = await knex.raw("PRAGMA table_info(users)");
    console.log('👤 Estrutura da tabela users:', usersSchema);
    
    // Verificar estrutura da tabela roles
    const rolesSchema = await knex.raw("PRAGMA table_info(roles)");
    console.log('🔑 Estrutura da tabela roles:', rolesSchema);
    
    // Verificar migrações executadas
    const migrations = await knex.migrate.list();
    console.log('📦 Migrações:', migrations);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await dbConnection.close();
  }
}

checkDatabase();
