#!/bin/bash

# Script para verificar por que os pratos não aparecem
# Execute: bash verificar-problema.sh

echo "🔍 Verificando por que os pratos não aparecem..."
echo ""

# Verificar se a aplicação está rodando
echo "1️⃣ Verificando se a aplicação está rodando:"
pm2 status | grep cardapio-3007
if [ $? -eq 0 ]; then
    echo "   ✅ Aplicação está rodando"
else
    echo "   ❌ Aplicação NÃO está rodando"
    echo "   Execute: pm2 start ecosystem.config.js"
    exit 1
fi

echo ""
echo "2️⃣ Testando API de pratos públicos:"
curl -s http://localhost:3007/api/dishes/public | head -20
echo ""

echo ""
echo "3️⃣ Verificando logs do PM2 (últimas 20 linhas):"
pm2 logs cardapio-3007 --lines 20 --nostream

echo ""
echo "4️⃣ Verificando se há pratos no banco de dados:"
if [ -f "cardapio.db" ]; then
    echo "   📊 Banco de dados encontrado"
    echo "   Verificando pratos ativos..."
    sqlite3 cardapio.db "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'active' THEN 1 END) as ativos FROM dishes;" 2>/dev/null || echo "   ⚠️  Não foi possível consultar o banco diretamente"
else
    echo "   ⚠️  Banco de dados não encontrado no diretório atual"
fi

echo ""
echo "5️⃣ Testando acesso à aplicação:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3007)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Aplicação responde (HTTP $HTTP_CODE)"
else
    echo "   ❌ Aplicação não responde corretamente (HTTP $HTTP_CODE)"
fi

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "💡 Possíveis soluções:"
echo "   1. Se não há pratos: Acesse /admin e cadastre pratos"
echo "   2. Se há erro na API: Verifique os logs acima"
echo "   3. Se a aplicação não está rodando: Execute ./deploy.sh"

