# RBAC System - Makefile
.PHONY: help install dev build start test lint format clean docker-build docker-up docker-down

# Default target
help:
	@echo "RBAC System - Comandos disponíveis:"
	@echo ""
	@echo "📦 Instalação:"
	@echo "  install     - Instalar dependências"
	@echo "  init-db     - Inicializar banco de dados"
	@echo ""
	@echo "🚀 Desenvolvimento:"
	@echo "  dev         - Executar em modo desenvolvimento"
	@echo "  build       - Compilar TypeScript"
	@echo "  start       - Executar em produção"
	@echo ""
	@echo "🧪 Testes:"
	@echo "  test        - Executar testes"
	@echo "  test-watch  - Executar testes em modo watch"
	@echo "  test-coverage - Executar testes com cobertura"
	@echo ""
	@echo "🔧 Qualidade:"
	@echo "  lint        - Verificar código"
	@echo "  lint-fix    - Corrigir problemas de linting"
	@echo "  format      - Formatar código"
	@echo "  format-check - Verificar formatação"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  docker-build - Build da imagem Docker"
	@echo "  docker-up    - Subir containers"
	@echo "  docker-down  - Parar containers"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  clean       - Limpar arquivos de build"

# Instalação
install:
	yarn install

init-db:
	yarn init-db

# Desenvolvimento
dev:
	yarn dev

build:
	yarn build

start:
	yarn start

# Testes
test:
	yarn test

test-watch:
	yarn test:watch

test-coverage:
	yarn test:coverage

# Qualidade de código
lint:
	yarn lint

lint-fix:
	yarn lint:fix

format:
	yarn format

format-check:
	yarn format:check

# Docker
docker-build:
	docker build -t rbac-system .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# Limpeza
clean:
	yarn clean
