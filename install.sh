#!/usr/bin/env bash
# =============================================================================
# install.sh — Instalador do Workspace Dinamico com Canvas Infinito (Linux/macOS)
# =============================================================================
# Este script fica na RAIZ do projeto (ao lado de core-platform/, .opencode/,
# pi-canvas-package/ e opencode-plugin/) e prepara os quatro pedaços do
# projeto de uma vez:
#
#   1. core-platform/      — Core React (sempre necessário)
#   2. .opencode/plugins/   — plugin REAL do OpenCode (Bun nativo, sem deps)
#   3. pi-canvas-package/   — pacote REAL do Pi (precisa de `npm install`)
#   4. opencode-plugin/     — versão standalone antiga (legado/opcional)
#
# Uso:
#   chmod +x install.sh && ./install.sh
# =============================================================================

set -euo pipefail

# --- Cores para saida no terminal ------------------------------------------
BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; RESET='\033[0m'

info()    { echo -e "${BOLD}==>${RESET} $1"; }
ok()      { echo -e "${GREEN}✓${RESET} $1"; }
warn()    { echo -e "${YELLOW}⚠${RESET} $1"; }
fail()    { echo -e "${RED}✗ $1${RESET}"; exit 1; }
section() { echo ""; echo -e "${CYAN}── $1 ──${RESET}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$SCRIPT_DIR/core-platform"
PI_DIR="$SCRIPT_DIR/pi-canvas-package"
LEGACY_DIR="$SCRIPT_DIR/opencode-plugin"
OPENCODE_PLUGIN_FILE="$SCRIPT_DIR/.opencode/plugins/canvas-plugin.js"

echo ""
echo "========================================================"
echo "  Workspace Dinamico — Instalador (Linux/macOS)"
echo "========================================================"

# --- 0. Verifica pre-requisitos ---------------------------------------------
section "Pré-requisitos"

command -v node >/dev/null 2>&1 || fail "Node.js não encontrado. Instale em https://nodejs.org/ (ou via nvm / gerenciador de pacotes da sua distro) e rode este script novamente."
command -v npm  >/dev/null 2>&1 || fail "npm não encontrado (normalmente vem junto com o Node.js)."

NODE_MAJOR_VERSION="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
  fail "Node.js 18+ é necessário (detectado: $(node -v)). Atualize o Node.js e rode novamente."
fi
ok "Node.js $(node -v) e npm $(npm -v) encontrados."

[ -d "$CORE_DIR/src" ] || fail "Pasta 'core-platform/src' não encontrada ao lado deste script. Rode o instalador a partir da raiz do projeto."
ok "Estrutura do projeto localizada em: $SCRIPT_DIR"

# --- 1. CORE (React + Vite) — sempre necessário -----------------------------
section "1/4 — Core (React + Vite)"

if [ -f "$CORE_DIR/package.json" ]; then
  warn "core-platform/package.json já existe — pulando geração de esqueleto."
else
  cat > "$CORE_DIR/package.json" <<'EOF'
{
  "name": "opencode-canvas-core",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0"
  }
}
EOF
  ok "core-platform/package.json criado."

  cat > "$CORE_DIR/vite.config.js" <<'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuracao minima do Vite — apenas o plugin de React e necessario.
// O Babel Standalone usado para compilar widgets em runtime e carregado
// via CDN no index.html e nao interfere no build do Vite.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
EOF
  ok "core-platform/vite.config.js criado."

  cat > "$CORE_DIR/index.html" <<'EOF'
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workspace Dinamico - Canvas Infinito</title>

    <!-- Tailwind CSS via CDN, usado tanto pelo Core quanto pelos widgets -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Babel Standalone: usado exclusivamente pelo WidgetWrapper.jsx para
         transpilar JSX vindo dos plugins (OpenCode/Pi) em tempo de
         execucao. Nao interfere no build do Core, que e feito normalmente
         pelo Vite. -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body class="bg-[#0B1120]">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF
  ok "core-platform/index.html criado (com Tailwind + Babel Standalone via CDN)."

  cat > "$CORE_DIR/src/main.jsx" <<'EOF'
// main.jsx — ponto de entrada do Vite, monta o App no #root.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
  ok "core-platform/src/main.jsx criado."
fi

info "Instalando dependências do Core (pode levar um minuto)..."
(cd "$CORE_DIR" && npm install --silent) || fail "Falha ao instalar dependências do core-platform."
ok "Dependências do Core instaladas."

# --- 2. Plugin REAL do OpenCode (Bun nativo, sem dependências) --------------
section "2/4 — Plugin do OpenCode (.opencode/plugins/)"

if [ -f "$OPENCODE_PLUGIN_FILE" ]; then
  ok "canvas-plugin.js encontrado — nenhuma instalação necessária (usa Bun.serve nativo)."
  echo "   Para ativar: abra o OpenCode Desktop/CLI nesta pasta ($SCRIPT_DIR),"
  echo "   ou copie o arquivo para ~/.config/opencode/plugins/ (uso global)."
else
  warn ".opencode/plugins/canvas-plugin.js não encontrado — pulando esta etapa."
fi

# --- 3. Pacote REAL do Pi (precisa de npm install para o 'ws') --------------
section "3/4 — Pacote do Pi (pi-canvas-package/)"

if [ -d "$PI_DIR" ]; then
  info "Instalando dependências do pacote Pi..."
  (cd "$PI_DIR" && npm install --silent) || fail "Falha ao instalar dependências do pi-canvas-package."
  ok "Dependências do pacote Pi instaladas."
  echo "   Para ativar: pi install \"$PI_DIR\"   (ou 'pi -e' para só testar)"
else
  warn "pi-canvas-package/ não encontrado — pulando esta etapa."
fi

# --- 4. Versão standalone legada (opcional) ---------------------------------
section "4/4 — Versão standalone legada (opcional)"

if [ -d "$LEGACY_DIR" ]; then
  info "Instalando dependências da versão standalone (opencode-plugin/)..."
  (cd "$LEGACY_DIR" && npm install --silent) || fail "Falha ao instalar dependências do opencode-plugin."
  ok "Dependências da versão standalone instaladas (legado — não é um plugin real)."
else
  warn "opencode-plugin/ não encontrado — pulando esta etapa (tudo bem, é opcional)."
fi

# --- Conclusao ---------------------------------------------------------------
echo ""
echo "========================================================"
ok "Instalação concluída!"
echo "========================================================"
echo ""
echo "Para rodar o Core (sempre necessário):"
echo "  cd \"$CORE_DIR\" && npm run dev"
echo "  → abra o endereço mostrado pelo Vite (geralmente http://localhost:5173)"
echo ""
echo "Escolha UM caminho para gerar widgets com IA:"
echo ""
echo "  [OpenCode] Abra o OpenCode Desktop/CLI apontando para:"
echo "             $SCRIPT_DIR"
echo "             (o plugin em .opencode/plugins/ é carregado automaticamente)"
echo ""
echo "  [Pi]       pi install \"$PI_DIR\""
echo ""
echo "  [Legado]   cd \"$LEGACY_DIR\" && npm start   (CLI de teste manual, sem IA real)"
echo ""
