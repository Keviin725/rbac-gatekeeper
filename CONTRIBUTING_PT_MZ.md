# Guia de Contribuição - Sistema RBAC 🇲🇿

## Bem-vindo à Comunidade!

Obrigado pelo seu interesse em contribuir para o sistema RBAC! Este guia foi criado especificamente para desenvolvedores moçambicanos e da comunidade lusófona.

## Índice

1. [Como Contribuir](#como-contribuir)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Padrões de Código](#padrões-de-código)
4. [Processo de Pull Request](#processo-de-pull-request)
5. [Reportar Bugs](#reportar-bugs)
6. [Sugerir Funcionalidades](#sugerir-funcionalidades)
7. [Comunidade](#comunidade)

## Como Contribuir

### Tipos de Contribuição

#### 🐛 **Correção de Bugs**
- Identificar e corrigir problemas existentes
- Melhorar tratamento de erros
- Otimizar performance

#### ✨ **Novas Funcionalidades**
- Adicionar novos endpoints da API
- Implementar novos middlewares
- Criar utilitários e helpers

#### 📚 **Documentação**
- Melhorar documentação existente
- Criar tutoriais e guias
- Traduzir documentação para português

#### 🧪 **Testes**
- Adicionar testes unitários
- Criar testes de integração
- Melhorar cobertura de testes

#### 🎨 **Melhorias de UX/UI**
- Melhorar interface do SDK
- Criar exemplos visuais
- Otimizar experiência do desenvolvedor

## Configuração do Ambiente

### 1. Fork e Clone

```bash
# Fazer fork do repositório no GitHub
# Depois clonar o seu fork
git clone https://github.com/SEU_USERNAME/rbac-system.git
cd rbac-system

# Adicionar repositório original como upstream
git remote add upstream https://github.com/original/rbac-system.git
```

### 2. Instalar Dependências

```bash
# Instalar dependências
yarn install

# Ou com npm
npm install
```

### 3. Configurar Ambiente de Desenvolvimento

```bash
# Copiar ficheiro de ambiente
cp .env.example .env

# Configurar variáveis
nano .env
```

```env
# Configuração para desenvolvimento
NODE_ENV=development
PORT=3001
DB_TYPE=sqlite
SQLITE_PATH=./database.sqlite
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h
```

### 4. Inicializar Base de Dados

```bash
# Executar migrações
yarn migrate

# Executar seeds
yarn seed

# Verificar se tudo está funcionando
yarn test
```

## Padrões de Código

### 1. Convenções de Nomenclatura

```typescript
// ✅ BOM: Nomes descritivos em português para comentários
/**
 * Verifica se o utilizador tem permissão específica
 * @param userId - ID do utilizador
 * @param permission - Permissão a verificar
 */
async verificarPermissao(userId: string, permission: PermissionCheck): Promise<boolean> {
  // Implementação...
}

// ❌ MAU: Nomes genéricos
async check(userId: string, perm: any): Promise<boolean> {
  // Implementação...
}
```

### 2. Estrutura de Ficheiros

```
src/
├── types/              # Definições de tipos
├── database/           # Migrações e seeds
├── repositories/       # Camada de dados
├── services/          # Lógica de negócio
├── middleware/        # Middleware de autenticação
├── controllers/       # Controladores da API
├── routes/           # Definição de rotas
├── sdk/             # SDK cliente
└── utils/           # Utilitários
```

### 3. Comentários e Documentação

```typescript
/**
 * Serviço de autenticação e autorização
 * Implementa lógica RBAC (Role-Based Access Control)
 * 
 * @example
 * ```typescript
 * const rbacService = new RBACService(knex, config);
 * const user = await rbacService.authenticateUser('admin', 'password');
 * ```
 */
export class RBACService {
  /**
   * Autentica utilizador com nome de utilizador e senha
   * @param username - Nome de utilizador
   * @param password - Senha em texto plano
   * @returns Resultado da autenticação ou null se inválido
   */
  async authenticateUser(username: string, password: string): Promise<AuthResult | null> {
    // Implementação...
  }
}
```

### 4. Tratamento de Erros

```typescript
// ✅ BOM: Tratamento específico de erros
try {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('Utilizador não encontrado');
  }
  return user;
} catch (error) {
  if (error instanceof NotFoundError) {
    throw error;
  }
  logger.error('Erro ao buscar utilizador:', error);
  throw new InternalServerError('Erro interno do servidor');
}

// ❌ MAU: Tratamento genérico
try {
  return await this.userRepository.findById(userId);
} catch (error) {
  throw error; // Re-throw sem contexto
}
```

### 5. Testes

```typescript
// ✅ BOM: Testes descritivos
describe('RBACService', () => {
  describe('autenticação de utilizador', () => {
    it('deve autenticar utilizador com credenciais válidas', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      
      // Act
      const result = await rbacService.authenticateUser(username, password);
      
      // Assert
      expect(result).toBeDefined();
      expect(result?.user.username).toBe(username);
      expect(result?.token).toBeTruthy();
    });

    it('deve rejeitar utilizador com credenciais inválidas', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'senha_errada';
      
      // Act
      const result = await rbacService.authenticateUser(username, password);
      
      // Assert
      expect(result).toBeNull();
    });
  });
});
```

## Processo de Pull Request

### 1. Criar Branch

```bash
# Atualizar branch principal
git checkout main
git pull upstream main

# Criar nova branch
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/corrigir-bug
# ou
git checkout -b docs/melhorar-documentacao
```

### 2. Desenvolver Funcionalidade

```bash
# Fazer commits pequenos e frequentes
git add .
git commit -m "feat: adiciona validação de email"

# Continuar desenvolvimento
git add .
git commit -m "test: adiciona testes para validação de email"

# Finalizar
git add .
git commit -m "docs: actualiza documentação da API"
```

### 3. Executar Testes

```bash
# Executar todos os testes
yarn test

# Executar testes com cobertura
yarn test:coverage

# Verificar linting
yarn lint

# Verificar formatação
yarn format:check
```

### 4. Criar Pull Request

```markdown
## Descrição
Breve descrição das mudanças implementadas.

## Tipo de Mudança
- [ ] Bug fix (correção que resolve um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou funcionalidade que quebra compatibilidade)
- [ ] Documentação (mudanças apenas na documentação)

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Checklist
- [ ] Meu código segue os padrões do projecto
- [ ] Realizei uma auto-revisão do meu código
- [ ] Comentei código complexo
- [ ] Actualizei a documentação
- [ ] Adicionei testes que provam que a correção é eficaz
- [ ] Novos e antigos testes passam localmente
- [ ] Qualquer mudança dependente foi actualizada

## Screenshots (se aplicável)
Adicionar screenshots para ajudar a explicar o problema.

## Contexto Adicional
Qualquer informação adicional relevante.
```

## Reportar Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Ir para '...'
2. Clicar em '...'
3. Ver erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Actual**
O que está a acontecer.

**Screenshots**
Se aplicável, adicionar screenshots.

**Ambiente:**
- OS: [ex: Ubuntu 20.04]
- Node.js: [ex: 18.17.0]
- Yarn: [ex: 1.22.19]
- Versão do RBAC: [ex: 1.0.0]

**Informações Adicionais**
Qualquer informação adicional relevante.
```

### Exemplo de Bug Report

```markdown
**Descrição do Bug**
O endpoint `/api/users` retorna erro 500 quando o utilizador não tem permissão.

**Passos para Reproduzir**
1. Fazer login como utilizador normal (não admin)
2. Fazer GET request para `/api/users`
3. Ver erro 500 em vez de 403

**Comportamento Esperado**
Deve retornar erro 403 (Forbidden) com mensagem clara.

**Comportamento Actual**
Retorna erro 500 (Internal Server Error).

**Logs de Erro**
```
Error: Cannot read property 'roles' of undefined
    at UserController.listUsers (/app/src/controllers/UserController.ts:45:12)
```

**Ambiente:**
- OS: Ubuntu 20.04 LTS
- Node.js: 18.17.0
- Yarn: 1.22.19
- Versão do RBAC: 1.0.0
```

## Sugerir Funcionalidades

### Template de Feature Request

```markdown
**Funcionalidade Sugerida**
Uma descrição clara e concisa da funcionalidade desejada.

**Problema que Resolve**
Que problema esta funcionalidade resolve?

**Solução Proposta**
Como gostaria que funcionasse?

**Alternativas Consideradas**
Outras soluções que considerou.

**Contexto Adicional**
Qualquer informação adicional relevante.
```

### Exemplo de Feature Request

```markdown
**Funcionalidade Sugerida**
Adicionar suporte para autenticação de dois factores (2FA).

**Problema que Resolve**
Melhora a segurança do sistema permitindo autenticação adicional.

**Solução Proposta**
- Adicionar campo `twoFactorEnabled` na tabela users
- Implementar geração de códigos TOTP
- Adicionar endpoint para activar/desactivar 2FA
- Modificar processo de login para incluir código 2FA

**Alternativas Consideradas**
- SMS 2FA (mais complexo, requer integração com provedor)
- Email 2FA (menos seguro)

**Contexto Adicional**
Esta funcionalidade é especialmente importante para ambientes corporativos em Moçambique.
```

## Comunidade

### Canais de Comunicação

#### 💬 **Discord**
- Servidor: [RBAC Mozambique](https://discord.gg/rbac-mozambique)
- Canais:
  - `#geral` - Discussões gerais
  - `#desenvolvimento` - Ajuda técnica
  - `#bugs` - Reportar problemas
  - `#funcionalidades` - Sugerir melhorias

#### 📱 **Telegram**
- Grupo: [@rbac_mozambique](https://t.me/rbac_mozambique)
- Para discussões rápidas e partilha de recursos

#### 📧 **Email**
- Geral: comunidade@rbac-mozambique.co.mz
- Técnico: suporte@rbac-mozambique.co.mz
- Contribuições: contribuicoes@rbac-mozambique.co.mz

### Eventos e Meetups

#### 🏢 **Maputo Tech Meetup**
- **Quando**: Primeira quinta-feira de cada mês
- **Onde**: Maputo, Moçambique
- **Tópicos**: Desenvolvimento, RBAC, Segurança

#### 💻 **Beira Dev Conference**
- **Quando**: Anual (Setembro)
- **Onde**: Beira, Moçambique
- **Foco**: Tecnologias emergentes, RBAC, Cloud

#### 🌐 **Eventos Online**
- **Webinars Mensais**: Última sexta-feira do mês
- **Workshops**: Sábados alternados
- **Code Reviews**: Quartas-feiras

### Recursos de Aprendizagem

#### 📚 **Documentação**
- [Guia do Iniciante](docs/GUIA_INICIANTE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Exemplos Práticos](examples/)

#### 🎥 **Vídeos**
- [Canal YouTube](https://youtube.com/rbac-mozambique)
- [Playlist: RBAC do Zero](https://youtube.com/playlist?list=...)
- [Tutoriais em Português](https://youtube.com/playlist?list=...)

#### 📖 **Cursos**
- [Curso Online Gratuito](https://cursos.rbac-mozambique.co.mz)
- [Certificação RBAC](https://certificacao.rbac-mozambique.co.mz)
- [Mentoria 1:1](https://mentoria.rbac-mozambique.co.mz)

### Reconhecimento

#### 🏆 **Contribuidores do Mês**
- **Janeiro 2024**: João Silva (Maputo)
- **Fevereiro 2024**: Maria Santos (Beira)
- **Março 2024**: Carlos Mário (Nampula)

#### 🎖️ **Badges de Contribuição**
- 🥉 **Bronze**: 1-5 contribuições
- 🥈 **Prata**: 6-15 contribuições
- 🥇 **Ouro**: 16+ contribuições
- 💎 **Diamante**: Contribuições excepcionais

### Código de Conduta

#### 🤝 **Nossa Comunidade**
- Seja respeitoso e inclusivo
- Use linguagem clara e construtiva
- Ajude outros desenvolvedores
- Partilhe conhecimento e experiências

#### 🚫 **Não Permitido**
- Linguagem ofensiva ou discriminatória
- Spam ou conteúdo irrelevante
- Compartilhar informações privadas
- Comportamento não profissional

## Agradecimentos

Obrigado por contribuir para o sistema RBAC! Cada contribuição, por menor que seja, ajuda a construir uma comunidade tecnológica mais forte em Moçambique.

### Contribuidores Activos

- **João Silva** (Maputo) - Core Developer
- **Maria Santos** (Beira) - Documentation Lead
- **Carlos Mário** (Nampula) - Testing Specialist
- **Ana Paula** (Quelimane) - UI/UX Designer
- **Pedro José** (Pemba) - DevOps Engineer

---

**Juntos, construímos o futuro da tecnologia em Moçambique!** 🇲🇿

**Desenvolvido com ❤️ pela comunidade de desenvolvedores moçambicanos**
