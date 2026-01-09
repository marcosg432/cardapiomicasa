#!/bin/bash

# Script para forçar atualização completa no servidor
# Execute este script no servidor após fazer git pull

set -e

echo "🔄 Forçando atualização completa do repositório..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto (/root/cardapio)"
    exit 1
fi

# Fazer backup do estado atual
echo "📦 Fazendo backup..."
git stash

# Forçar reset para o estado do repositório remoto
echo "🔄 Resetando para o estado do repositório remoto..."
git fetch origin
git reset --hard origin/main

# Verificar se os arquivos de configuração existem
echo "✅ Verificando arquivos de configuração..."
if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ ecosystem.config.js não encontrado após git pull"
    echo "📥 Baixando novamente do repositório..."
    git checkout origin/main -- ecosystem.config.js
fi

if [ ! -f "server.js" ]; then
    echo "❌ server.js não encontrado após git pull"
    echo "📥 Baixando novamente do repositório..."
    git checkout origin/main -- server.js
fi

if [ ! -f "deploy.sh" ]; then
    echo "❌ deploy.sh não encontrado após git pull"
    echo "📥 Baixando novamente do repositório..."
    git checkout origin/main -- deploy.sh
    chmod +x deploy.sh
fi

# Verificar se o arquivo beverages/[id].tsx foi atualizado
echo "🔍 Verificando correção do TypeScript..."
if grep -q "typeof formData.price === 'number' ? formData.price : 0" "pages/admin/beverages/[id].tsx"; then
    echo "✅ Correção do TypeScript encontrada"
else
    echo "⚠️  Correção do TypeScript não encontrada. Aplicando correção manual..."
    # Aplicar correção manual
    sed -i "s/price: typeof formData\.price === 'string'? Number(formData\.price\.replace(',', '.')) : (formData\.price || 0),/price: typeof formData.price === 'string' ? Number(formData.price.replace(',', '.')) : (typeof formData.price === 'number' ? formData.price : 0),/g" "pages/admin/beverages/[id].tsx"
    sed -i "s/display_order: typeof formData\.display_order === 'string'? Number(formData\.display_order) : (formData\.display_order || 0),/display_order: typeof formData.display_order === 'string' ? Number(formData.display_order) : (typeof formData.display_order === 'number' ? formData.display_order : 0),/g" "pages/admin/beverages/[id].tsx"
    echo "✅ Correção aplicada"
fi

echo ""
echo "✅ Atualização concluída!"
echo "📋 Arquivos verificados:"
ls -la ecosystem.config.js server.js deploy.sh 2>/dev/null || echo "⚠️  Alguns arquivos ainda não foram encontrados"

echo ""
echo "🚀 Próximos passos:"
echo "   1. Execute: npm install --production"
echo "   2. Execute: npm run build"
echo "   3. Execute: ./deploy.sh"

