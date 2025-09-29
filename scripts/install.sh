#!/bin/bash

# Script de instalação rápida para o RBAC System
echo "🚀 Instalando RBAC System..."

# Verificar se Yarn está instalado
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn não encontrado. Instalando Yarn..."
    npm install -g yarn
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

echo "📦 Instalando dependências..."
yarn install

echo "🗄️  Inicializando banco de dados..."
yarn init-db

echo "✅ Instalação concluída!"
echo ""
echo "🎯 Para executar o projeto:"
echo "   yarn dev          # Desenvolvimento"
echo "   yarn build        # Compilar"
echo "   yarn start        # Produção"
echo "   yarn test         # Testes"
echo ""
echo "📚 Documentação:"
echo "   - README.md       # Documentação principal"
echo "   - YARN_SETUP.md   # Configuração do Yarn"
echo "   - examples/       # Exemplos de uso"
