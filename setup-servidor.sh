#!/bin/bash

# Script completo para configurar o servidor do zero
# Execute este script no servidor: bash <(curl -s) ou copie e cole

set -e

echo "🚀 Configurando servidor para cardápio na porta 3007..."
echo ""

# Verificar se está no diretório correto
if [ ! -d "/root/cardapio" ]; then
    echo "📦 Clonando repositório..."
    cd /root
    git clone https://github.com/marcosg432/cardapiomicasa.git cardapio
    cd cardapio
else
    echo "📂 Entrando no diretório do projeto..."
    cd /root/cardapio
fi

echo "🔄 Forçando atualização do repositório..."
# Limpar cache do git completamente
git fetch --all --prune --force 2>/dev/null || true

# Tentar buscar diretamente do GitHub usando a URL
echo "📥 Buscando atualizações do GitHub..."
git fetch https://github.com/marcosg432/cardapiomicasa.git main:temp-main --force 2>/dev/null || true

# Se conseguiu buscar, usar esse branch
if git show-ref --verify --quiet refs/heads/temp-main; then
    echo "✅ Atualizações encontradas, aplicando..."
    git reset --hard temp-main 2>/dev/null || true
    git branch -D temp-main 2>/dev/null || true
else
    # Se não conseguiu, tentar método tradicional
    git fetch origin --force 2>/dev/null || true
    git reset --hard origin/main 2>/dev/null || true
fi

echo "📋 Commit atual:"
git log --oneline -1 || echo "⚠️  Não foi possível verificar commit"

# Verificar se os arquivos existem agora
echo ""
echo "✅ Verificando arquivos de configuração..."
if [ -f "ecosystem.config.js" ]; then
    echo "  ✅ ecosystem.config.js encontrado"
else
    echo "  ❌ ecosystem.config.js NÃO encontrado"
    echo "  📥 Tentando baixar novamente..."
    git checkout origin/main -- ecosystem.config.js || echo "  ⚠️  Falha ao baixar ecosystem.config.js"
fi

if [ -f "server.js" ]; then
    echo "  ✅ server.js encontrado"
else
    echo "  ❌ server.js NÃO encontrado"
    echo "  📥 Tentando baixar novamente..."
    git checkout origin/main -- server.js || echo "  ⚠️  Falha ao baixar server.js"
fi

if [ -f "deploy.sh" ]; then
    echo "  ✅ deploy.sh encontrado"
    chmod +x deploy.sh
else
    echo "  ❌ deploy.sh NÃO encontrado"
    echo "  📝 Criando deploy.sh manualmente..."
    cat > deploy.sh << 'DEPLOYEOF'
#!/bin/bash

# Script de deploy para o cardápio na porta 3007
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do cardápio na porta 3007..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script no diretório do projeto.${NC}"
    exit 1
fi

# Criar diretório de logs se não existir
mkdir -p logs

# Parar o processo PM2 se já estiver rodando
echo -e "${YELLOW}📦 Parando processo PM2 existente (se houver)...${NC}"
pm2 stop cardapio-3007 2>/dev/null || true
pm2 delete cardapio-3007 2>/dev/null || true

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install --production

# Fazer build do Next.js
echo -e "${YELLOW}🔨 Fazendo build do projeto...${NC}"
npm run build

# Iniciar com PM2
echo -e "${YELLOW}🚀 Iniciando aplicação com PM2...${NC}"
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Mostrar status
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}📊 Status do PM2:${NC}"
pm2 status

echo -e "${GREEN}📝 Logs disponíveis em:${NC}"
echo "  - /root/cardapio/logs/pm2-out.log"
echo "  - /root/cardapio/logs/pm2-error.log"
echo ""
echo -e "${GREEN}🔍 Para ver os logs em tempo real:${NC}"
echo "  pm2 logs cardapio-3007"
echo ""
echo -e "${GREEN}🌐 Aplicação rodando em: http://193.160.119.67:3007${NC}"
DEPLOYEOF
    chmod +x deploy.sh
    echo "  ✅ deploy.sh criado"
fi

# Criar arquivos manualmente se não existirem
if [ ! -f "ecosystem.config.js" ]; then
    echo "📝 Criando ecosystem.config.js manualmente..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'cardapio-3007',
      script: 'server.js',
      cwd: '/root/cardapio',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
        HOST: '0.0.0.0'
      },
      error_file: '/root/cardapio/logs/pm2-error.log',
      out_file: '/root/cardapio/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
EOF
    echo "  ✅ ecosystem.config.js criado"
fi

if [ ! -f "server.js" ]; then
    echo "📝 Criando server.js manualmente..."
    cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3007', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
EOF
    echo "  ✅ server.js criado"
fi

# Corrigir erro de TypeScript
echo ""
echo "🔧 Verificando e corrigindo erro de TypeScript..."
BEVERAGE_FILE="pages/admin/beverages/[id].tsx"
if [ -f "$BEVERAGE_FILE" ]; then
    # Verificar se já está corrigido
    if ! grep -q "typeof formData.price === 'number' ? formData.price : 0" "$BEVERAGE_FILE"; then
        echo "  🔧 Aplicando correção no arquivo beverages/[id].tsx..."
        # Fazer backup
        cp "$BEVERAGE_FILE" "${BEVERAGE_FILE}.backup"
        
        # Aplicar correção
        sed -i "s/price: typeof formData\.price === 'string'? Number(formData\.price\.replace(',', '.')) : (formData\.price || 0),/price: typeof formData.price === 'string' ? Number(formData.price.replace(',', '.')) : (typeof formData.price === 'number' ? formData.price : 0),/g" "$BEVERAGE_FILE"
        sed -i "s/display_order: typeof formData\.display_order === 'string'? Number(formData\.display_order) : (formData\.display_order || 0),/display_order: typeof formData.display_order === 'string' ? Number(formData.display_order) : (typeof formData.display_order === 'number' ? formData.display_order : 0),/g" "$BEVERAGE_FILE"
        sed -i "s/formData\. price/formData.price/g" "$BEVERAGE_FILE"
        echo "  ✅ Correção aplicada"
    else
        echo "  ✅ Arquivo já está corrigido"
    fi
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Arquivos verificados:"
ls -la ecosystem.config.js server.js deploy.sh 2>/dev/null | head -3

echo ""
echo "🚀 Próximos passos:"
echo "   1. npm install --production"
echo "   2. npm run build"
echo "   3. ./deploy.sh"

