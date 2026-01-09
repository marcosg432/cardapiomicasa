#!/bin/bash

# Script para remover TODAS as duplicatas e garantir apenas uma declaração
# Execute: bash remover-todas-duplicatas.sh

FILE="pages/admin/beverages/[id].tsx"

echo "🧹 Removendo TODAS as duplicatas das variáveis..."

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

# Fazer backup
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup criado"

# Usar Python para remover TODAS as duplicatas
python3 << 'PYTHON_SCRIPT'
import re
import sys

file_path = "pages/admin/beverages/[id].tsx"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Encontrar o bloco handleSubmit
    # Procurar por: const handleSubmit ... { ... try { ... } ... }
    
    # Primeiro, remover TODAS as declarações de priceValue e displayOrderValue
    # que estão dentro de qualquer bloco try
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    in_handle_submit = False
    in_try_block = False
    variables_added = False
    skip_lines = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detectar início de handleSubmit
        if 'const handleSubmit' in line or ('handleSubmit' in line and 'async' in line):
            in_handle_submit = True
            new_lines.append(line)
            i += 1
            continue
        
        # Detectar fim de handleSubmit (próxima função ou fim do componente)
        if in_handle_submit and (line.strip().startswith('const ') or line.strip().startswith('export ') or line.strip() == '}'):
            if not line.strip().startswith('const handle') and not 'handleSubmit' in line:
                in_handle_submit = False
                in_try_block = False
                variables_added = False
        
        # Detectar início do try dentro de handleSubmit
        if in_handle_submit and 'try {' in line:
            in_try_block = True
            new_lines.append(line)
            i += 1
            # Adicionar as variáveis IMEDIATAMENTE após o try {
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
        
        # Detectar fim do try
        if '} catch' in line or '}catch' in line:
            in_try_block = False
        
        # Se estiver dentro do try e encontrar declaração de priceValue ou displayOrderValue, PULAR
        if in_try_block and ('const priceValue' in line or 'const displayOrderValue' in line):
            # Pular esta linha e todas as linhas relacionadas até o ponto e vírgula
            i += 1
            while i < len(lines):
                current_line = lines[i]
                # Continuar pulando se for parte da definição (ternário, etc)
                if (current_line.strip().startswith('?') or 
                    current_line.strip().startswith(':') or 
                    'Number(' in current_line or 
                    'typeof' in current_line or
                    current_line.strip() == '' or
                    current_line.strip() == ';' or
                    current_line.strip().endswith(');')):
                    i += 1
                else:
                    break
            continue
        
        # Se encontrar comentário duplicado sobre type assertion dentro do try, pular
        if in_try_block and '// Preparar valores com type assertion' in line and variables_added:
            i += 1
            continue
        
        new_lines.append(line)
        i += 1
    
    # Escrever arquivo corrigido
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print("✅ Todas as duplicatas removidas!")
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
    echo "Contagem de variáveis (deve ser 1 de cada):"
    PRICE_COUNT=$(grep -c "const priceValue" "$FILE")
    DISPLAY_COUNT=$(grep -c "const displayOrderValue" "$FILE")
    echo "  priceValue: $PRICE_COUNT"
    echo "  displayOrderValue: $DISPLAY_COUNT"
    echo ""
    
    if [ "$PRICE_COUNT" -eq 1 ] && [ "$DISPLAY_COUNT" -eq 1 ]; then
        echo "✅ Perfeito! Apenas uma declaração de cada variável."
    else
        echo "⚠️  Ainda há duplicatas. Mostrando localizações:"
        grep -n "const priceValue\|const displayOrderValue" "$FILE"
    fi
    
    echo ""
    echo "Linhas do bloco try em handleSubmit:"
    grep -A15 "const handleSubmit" "$FILE" | grep -A15 "try {" | head -20
    echo ""
    echo "✅ Verificação concluída!"
else
    echo "❌ Erro ao remover duplicatas"
    exit 1
fi

