#!/bin/bash

# Script para corrigir o erro final - adiciona o === que está faltando
# Execute: bash corrigir-final.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🔧 Corrigindo erro final em $FILE..."

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

# Corrigir o === que está faltando
sed -i "s/typeof formData\.price 'number'/typeof formData.price === 'number'/g" "$FILE"
sed -i "s/typeof formData\.display_order 'number'/typeof formData.display_order === 'number'/g" "$FILE"

# Também garantir que os espaços estão corretos
sed -i "s/formData\.price:/formData.price:/g" "$FILE"
sed -i "s/'string'?/'string' ?/g" "$FILE"
sed -i "s/formData\.price: 0)/formData.price : 0)/g" "$FILE"

# Verificar
echo ""
echo "📋 Linha corrigida:"
grep -n "price: typeof formData.price" "$FILE" | head -1

echo ""
echo "📋 Verificando se está correto:"
if grep -q "typeof formData.price === 'number' ? formData.price : 0" "$FILE"; then
    echo "✅ Correção aplicada com sucesso!"
else
    echo "⚠️  Ainda pode haver problemas. Verifique manualmente."
    echo ""
    echo "📋 Linhas relacionadas:"
    grep -n "price.*formData\|display_order.*formData" "$FILE" | head -5
fi

echo ""
echo "✅ Processo concluído!"

