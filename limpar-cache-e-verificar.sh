#!/bin/bash

# Script para limpar cache e verificar o arquivo
# Execute: bash limpar-cache-e-verificar.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🧹 Limpando cache do Next.js..."
rm -rf .next
echo "✅ Cache limpo"

echo ""
echo "🔍 Verificando estrutura do arquivo..."

# Verificar se as variáveis estão no escopo correto
echo ""
echo "📋 Verificando escopo das variáveis:"
LINE_PRICE=$(grep -n "const priceValue" "$FILE" | cut -d: -f1)
LINE_DISPLAY=$(grep -n "const displayOrderValue" "$FILE" | cut -d: -f1)
LINE_USE_PRICE=$(grep -n "price: priceValue" "$FILE" | cut -d: -f1)

if [ -z "$LINE_PRICE" ] || [ -z "$LINE_DISPLAY" ] || [ -z "$LINE_USE_PRICE" ]; then
    echo "❌ Variáveis não encontradas! Aplicando correção..."
    curl -s https://raw.githubusercontent.com/marcosg432/cardapiomicasa/main/corrigir-completo.sh | bash
    exit 0
fi

echo "✅ Variáveis encontradas nas linhas:"
echo "   priceValue: linha $LINE_PRICE"
echo "   displayOrderValue: linha $LINE_DISPLAY"
echo "   uso de priceValue: linha $LINE_USE_PRICE"

# Verificar se estão no mesmo bloco try
LINE_TRY=$(grep -n "try {" "$FILE" | tail -1 | cut -d: -f1)
LINE_CATCH=$(grep -n "} catch" "$FILE" | tail -1 | cut -d: -f1)

if [ -n "$LINE_TRY" ] && [ -n "$LINE_CATCH" ]; then
    echo ""
    echo "📋 Verificando escopo do bloco try:"
    echo "   try { na linha $LINE_TRY"
    echo "   catch na linha $LINE_CATCH"
    
    if [ "$LINE_PRICE" -gt "$LINE_TRY" ] && [ "$LINE_PRICE" -lt "$LINE_CATCH" ] && [ "$LINE_USE_PRICE" -gt "$LINE_PRICE" ] && [ "$LINE_USE_PRICE" -lt "$LINE_CATCH" ]; then
        echo "✅ Variáveis estão no escopo correto!"
    else
        echo "⚠️  Possível problema de escopo detectado"
        echo "🔧 Aplicando correção..."
        curl -s https://raw.githubusercontent.com/marcosg432/cardapiomicasa/main/corrigir-completo.sh | bash
    fi
fi

echo ""
echo "📋 Mostrando contexto completo:"
sed -n "${LINE_TRY},${LINE_USE_PRICE}p" "$FILE" | head -20

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "🚀 Agora teste o build:"
echo "   npm run build"

