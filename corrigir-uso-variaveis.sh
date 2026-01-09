#!/bin/bash

# Script para corrigir o uso das variáveis no body
# Execute: bash corrigir-uso-variaveis.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🔧 Corrigindo uso das variáveis no body..."

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

# Fazer backup
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup criado"

# Usar Python para substituir o uso direto pelas variáveis
python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = "pages/admin/beverages/[id].tsx"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Substituir o uso direto de formData.price no body por priceValue
    # Padrão: price: typeof formData.price === 'string'? Number(formData.price.replace(',', '.')): (formData.price || 0),
    pattern1 = r"price:\s*typeof\s+formData\.price\s*===\s*'string'\s*\?\s*Number\s*\(\s*formData\.price\.replace\s*\(\s*','\s*,\s*'\.'\s*\)\s*\)\s*:\s*\(\s*formData\.price\s*\|\|\s*0\s*\),"
    replacement1 = "price: priceValue,"
    content = re.sub(pattern1, replacement1, content)
    
    # Também tentar padrão mais simples
    pattern1_simple = r"price:\s*typeof\s+formData\.price[^,]*,\s*"
    if 'price: priceValue' not in content:
        content = re.sub(pattern1_simple, "price: priceValue,\n          ", content)
    
    # Substituir o uso direto de formData.display_order no body por displayOrderValue
    pattern2 = r"display_order:\s*typeof\s+formData\.display_order\s*===\s*'string'\s*\?\s*Number\s*\(\s*formData\.display_order\s*\)\s*:\s*\(\s*formData\.display_order\s*\|\|\s*0\s*\),"
    replacement2 = "display_order: displayOrderValue,"
    content = re.sub(pattern2, replacement2, content)
    
    # Também tentar padrão mais simples
    pattern2_simple = r"display_order:\s*typeof\s+formData\.display_order[^,]*,\s*"
    if 'display_order: displayOrderValue' not in content:
        content = re.sub(pattern2_simple, "display_order: displayOrderValue,\n          ", content)
    
    # Escrever arquivo corrigido
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Uso das variáveis corrigido!")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "📋 Verificando correção:"
    echo ""
    echo "Linhas do body:"
    grep -A5 "body: JSON.stringify" "$FILE" | head -8
    echo ""
    
    if grep -q "price: priceValue" "$FILE" && grep -q "display_order: displayOrderValue" "$FILE"; then
        echo "✅ Correção aplicada com sucesso!"
    else
        echo "⚠️  Verifique se a correção foi aplicada corretamente"
    fi
else
    echo "❌ Erro ao aplicar correção"
    exit 1
fi

echo ""
echo "✅ Processo concluído!"

