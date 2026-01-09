#!/bin/bash

# Script para adicionar variáveis se não existirem
# Execute: bash adicionar-variaveis-se-faltarem.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🔍 Verificando se as variáveis existem..."

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

# Verificar se as variáveis existem
PRICE_COUNT=$(grep -c "const priceValue" "$FILE")
DISPLAY_COUNT=$(grep -c "const displayOrderValue" "$FILE")

if [ "$PRICE_COUNT" -eq 0 ] || [ "$DISPLAY_COUNT" -eq 0 ]; then
    echo "⚠️  Variáveis não encontradas. Adicionando..."
    
    # Fazer backup
    cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup criado"
    
    # Usar Python para adicionar as variáveis no lugar correto
    python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = "pages/admin/beverages/[id].tsx"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    in_handle_submit = False
    try_found = False
    variables_added = False
    
    while i < len(lines):
        line = lines[i]
        
        # Detectar handleSubmit
        if 'const handleSubmit' in line or ('handleSubmit' in line and 'async' in line):
            in_handle_submit = True
            new_lines.append(line)
            i += 1
            continue
        
        # Detectar try dentro de handleSubmit
        if in_handle_submit and 'try {' in line:
            try_found = True
            new_lines.append(line)
            i += 1
            # Adicionar variáveis imediatamente após o try {
            if not variables_added:
                new_lines.append("      // Preparar valores com type assertion para evitar erro de TypeScript\n")
                new_lines.append("      const priceValue = typeof formData.price === 'string' \n")
                new_lines.append("        ? Number((formData.price as string).replace(',', '.')) \n")
                new_lines.append("        : (typeof formData.price === 'number' ? formData.price : 0);\n")
                new_lines.append("      \n")
                new_lines.append("      const displayOrderValue = typeof formData.display_order === 'string' \n")
                new_lines.append("        ? Number(formData.display_order as string) \n")
                new_lines.append("        : (typeof formData.display_order === 'number' ? formData.display_order : 0);\n")
                new_lines.append("\n")
                variables_added = True
            continue
        
        # Se encontrar const res = await fetch mas não tem as variáveis, adicionar antes
        if in_handle_submit and 'const res = await fetch' in line and not variables_added:
            new_lines.append("      // Preparar valores com type assertion para evitar erro de TypeScript\n")
            new_lines.append("      const priceValue = typeof formData.price === 'string' \n")
            new_lines.append("        ? Number((formData.price as string).replace(',', '.')) \n")
            new_lines.append("        : (typeof formData.price === 'number' ? formData.price : 0);\n")
            new_lines.append("      \n")
            new_lines.append("      const displayOrderValue = typeof formData.display_order === 'string' \n")
            new_lines.append("        ? Number(formData.display_order as string) \n")
            new_lines.append("        : (typeof formData.display_order === 'number' ? formData.display_order : 0);\n")
            new_lines.append("\n")
            variables_added = True
        
        new_lines.append(line)
        i += 1
    
    # Escrever arquivo
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("✅ Variáveis adicionadas com sucesso!")
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT

    if [ $? -eq 0 ]; then
        echo ""
        echo "📋 Verificando:"
        PRICE_COUNT=$(grep -c "const priceValue" "$FILE")
        DISPLAY_COUNT=$(grep -c "const displayOrderValue" "$FILE")
        echo "  priceValue: $PRICE_COUNT"
        echo "  displayOrderValue: $DISPLAY_COUNT"
        
        if [ "$PRICE_COUNT" -eq 1 ] && [ "$DISPLAY_COUNT" -eq 1 ]; then
            echo ""
            echo "✅ Perfeito! Variáveis adicionadas corretamente."
        else
            echo ""
            echo "⚠️  Ainda há problemas. Verifique manualmente."
        fi
    fi
else
    echo "✅ Variáveis já existem!"
    echo "  priceValue: $PRICE_COUNT"
    echo "  displayOrderValue: $DISPLAY_COUNT"
fi

echo ""
echo "✅ Processo concluído!"

