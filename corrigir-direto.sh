#!/bin/bash

# Script para corrigir o erro de TypeScript diretamente - versão mais robusta
# Execute: bash corrigir-direto.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🔧 Corrigindo erro de TypeScript em $FILE..."

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

# Fazer backup
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup criado"

# Usar Python para fazer a substituição de forma mais precisa
python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = "pages/admin/beverages/[id].tsx"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Padrão original que precisa ser corrigido
    # Procurar por: price: typeof formData.price === 'string'? Number(formData.price.replace(',', '.')) : (formData.price || 0),
    # Substituir por: price: typeof formData.price === 'string' ? Number(formData.price.replace(',', '.')) : (typeof formData.price === 'number' ? formData.price : 0),
    
    # Múltiplos padrões possíveis
    patterns = [
        (r"price:\s*typeof\s+formData\.price\s*===\s*'string'\s*\?\s*Number\s*\(\s*formData\.price\.replace\s*\(\s*','\s*,\s*'\.'\s*\)\s*\)\s*:\s*\(\s*formData\.price\s*\|\|\s*0\s*\)\s*,", 
         "price: typeof formData.price === 'string' ? Number(formData.price.replace(',', '.')) : (typeof formData.price === 'number' ? formData.price : 0),"),
        (r"price:\s*typeof\s+formData\.price\s*===\s*'string'\?\s*Number\s*\(\s*formData\.price\.replace\s*\(\s*','\s*,\s*'\.'\s*\)\s*\)\s*:\s*\(\s*formData\.price\s*\|\|\s*0\s*\)\s*,", 
         "price: typeof formData.price === 'string' ? Number(formData.price.replace(',', '.')) : (typeof formData.price === 'number' ? formData.price : 0),"),
    ]
    
    original_content = content
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    # Corrigir display_order também
    display_patterns = [
        (r"display_order:\s*typeof\s+formData\.display_order\s*===\s*'string'\s*\?\s*Number\s*\(\s*formData\.display_order\s*\)\s*:\s*\(\s*formData\.display_order\s*\|\|\s*0\s*\)\s*,", 
         "display_order: typeof formData.display_order === 'string' ? Number(formData.display_order) : (typeof formData.display_order === 'number' ? formData.display_order : 0),"),
        (r"display_order:\s*typeof\s+formData\.display_order\s*===\s*'string'\?\s*Number\s*\(\s*formData\.display_order\s*\)\s*:\s*\(\s*formData\.display_order\s*\|\|\s*0\s*\)\s*,", 
         "display_order: typeof formData.display_order === 'string' ? Number(formData.display_order) : (typeof formData.display_order === 'number' ? formData.display_order : 0),"),
    ]
    
    for pattern, replacement in display_patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Correção aplicada com sucesso!")
        sys.exit(0)
    else:
        print("⚠️  Nenhuma alteração necessária ou padrão não encontrado")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Erro: {e}")
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "📋 Verificando linha corrigida:"
    grep -n "price: typeof formData.price" "$FILE" | head -1
    echo ""
    echo "✅ Processo concluído!"
else
    echo ""
    echo "⚠️  Tentando método alternativo com sed mais simples..."
    
    # Método alternativo: substituir linha por linha usando sed mais simples
    # Primeiro, encontrar a linha exata
    LINE_NUM=$(grep -n "price: typeof formData.price === 'string'?" "$FILE" | cut -d: -f1 | head -1)
    
    if [ -n "$LINE_NUM" ]; then
        echo "📝 Linha encontrada: $LINE_NUM"
        # Ler a linha atual
        CURRENT_LINE=$(sed -n "${LINE_NUM}p" "$FILE")
        echo "📋 Linha atual: $CURRENT_LINE"
        
        # Substituir usando sed com escape correto
        sed -i "${LINE_NUM}s/(formData\.price || 0)/(typeof formData.price === 'number' ? formData.price : 0)/g" "$FILE"
        sed -i "${LINE_NUM}s/'string'?/'string' ?/g" "$FILE"
        
        echo "✅ Correção aplicada (método alternativo)"
        echo "📋 Linha após correção:"
        sed -n "${LINE_NUM}p" "$FILE"
    else
        echo "❌ Não foi possível encontrar a linha para corrigir"
        echo "📋 Linhas relacionadas a price:"
        grep -n "price.*formData" "$FILE" | head -5
    fi
fi

