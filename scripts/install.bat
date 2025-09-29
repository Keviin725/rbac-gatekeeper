@echo off
echo 🚀 Instalando RBAC System...

REM Verificar se Yarn está instalado
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Yarn não encontrado. Instalando Yarn...
    npm install -g yarn
)

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale Node.js primeiro.
    pause
    exit /b 1
)

echo 📦 Instalando dependências...
yarn install

echo 🗄️  Inicializando banco de dados...
yarn init-db

echo ✅ Instalação concluída!
echo.
echo 🎯 Para executar o projeto:
echo    yarn dev          # Desenvolvimento
echo    yarn build        # Compilar
echo    yarn start        # Produção
echo    yarn test         # Testes
echo.
echo 📚 Documentação:
echo    - README.md       # Documentação principal
echo    - YARN_SETUP.md   # Configuração do Yarn
echo    - examples/       # Exemplos de uso
pause
