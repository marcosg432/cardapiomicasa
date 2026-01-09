#!/bin/bash

# Script para inicializar o banco de dados
# Execute: bash inicializar-banco.sh

echo "🗄️  Inicializando banco de dados..."

# Verificar se a aplicação está rodando
if ! pm2 list | grep -q "cardapio-3007.*online"; then
    echo "❌ Aplicação não está rodando. Inicie primeiro com: pm2 start ecosystem.config.js"
    exit 1
fi

echo "✅ Aplicação está rodando"

# Aguardar um pouco para garantir que está pronta
sleep 2

# Chamar API de inicialização
echo "📡 Chamando API de inicialização..."
RESPONSE=$(curl -s -X POST http://localhost:3007/api/init-db)

if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Banco de dados inicializado com sucesso!"
    echo ""
    echo "📋 Resposta da API:"
    echo "$RESPONSE" | head -5
else
    echo "⚠️  Resposta da API:"
    echo "$RESPONSE"
    echo ""
    echo "💡 Tentando método alternativo..."
    
    # Tentar via API init
    curl -s -X POST http://localhost:3007/api/init
    echo ""
    echo "✅ Tentativa de inicialização via /api/init concluída"
fi

echo ""
echo "🔍 Verificando se as tabelas foram criadas..."
# Verificar se o banco existe e tem tabelas
if [ -f "cardapio.db" ]; then
    if command -v sqlite3 &> /dev/null; then
        TABLES=$(sqlite3 cardapio.db ".tables" 2>/dev/null)
        if [ -n "$TABLES" ]; then
            echo "✅ Tabelas encontradas:"
            echo "$TABLES"
        else
            echo "⚠️  Nenhuma tabela encontrada"
        fi
    else
        echo "⚠️  sqlite3 não instalado. Não é possível verificar tabelas diretamente"
    fi
else
    echo "⚠️  Arquivo cardapio.db não encontrado"
fi

echo ""
echo "✅ Processo concluído!"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Acesse http://193.160.119.67:3007/admin"
echo "   2. Faça login (admin@admin.com / admin123)"
echo "   3. Cadastre pratos e bebidas"

