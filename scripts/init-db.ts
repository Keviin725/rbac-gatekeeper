import { DatabaseConnection } from '../src/database/connection';
import { RBACConfig } from '../src/types';

const config: RBACConfig = {
  database: {
    type: 'sqlite',
    sqlitePath: './database.sqlite'
  },
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '24h'
  }
};

async function initializeDatabase() {
  console.log('🗄️  Inicializando banco de dados...');
  
  try {
    const dbConnection = DatabaseConnection.getInstance(config);
    const knex = dbConnection.getKnex();

    // Run migrations
    console.log('📦 Executando migrações...');
    await knex.migrate.latest();
    console.log('✅ Migrações executadas com sucesso');

    // Run seeds
    console.log('🌱 Executando seeds...');
    await knex.seed.run();
    console.log('✅ Seeds executados com sucesso');

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('\n📋 Dados iniciais criados:');
    console.log('👤 Usuário admin: admin / password');
    console.log('👤 Usuário comum: user1 / password');
    console.log('🔑 Roles: admin, user, manager');
    console.log('🔐 Permissões: users:*, roles:*, permissions:*, content:*');

    await dbConnection.close();
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase();
