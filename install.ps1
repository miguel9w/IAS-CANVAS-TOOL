# =============================================================================
# install.ps1 - Instalador do Workspace Dinamico com Canvas Infinito (Windows)
# =============================================================================
# Este script fica na RAIZ do projeto (ao lado de core-platform\, .opencode\,
# pi-canvas-package\ e opencode-plugin\) e prepara os quatro pedacos do
# projeto de uma vez:
#
#   1. core-platform\      - Core React (sempre necessario)
#   2. .opencode\plugins\  - plugin REAL do OpenCode (Bun nativo, sem deps)
#   3. pi-canvas-package\  - pacote REAL do Pi (precisa de "npm install")
#   4. opencode-plugin\    - versao standalone antiga (legado/opcional)
#
# Como rodar:
#   Opcao A) Clique com o botao direito neste arquivo -> "Executar com o PowerShell"
#   Opcao B) Em um terminal PowerShell:
#              powershell -ExecutionPolicy Bypass -File .\install.ps1
#
#   Se o Windows bloquear a execucao (politica de execucao), use a Opcao B,
#   ou rode antes: Unblock-File -Path .\install.ps1
# =============================================================================

function Write-Info($msg)    { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg)    { Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Section($msg) { Write-Host ""; Write-Host "-- $msg --" -ForegroundColor Cyan }

# Grava um arquivo em UTF-8 SEM BOM. Necessario porque Set-Content/Out-File
# no Windows PowerShell (5.1) gravam UTF-8 COM BOM por padrao, o que quebra
# JSON.parse (ex: package.json) com "Unexpected token '\ufeff'".
function Write-Utf8NoBom {
    param([string]$Path, [string]$Content)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$CoreDir    = Join-Path $ScriptDir 'core-platform'
$PiDir      = Join-Path $ScriptDir 'pi-canvas-package'
$LegacyDir  = Join-Path $ScriptDir 'opencode-plugin'
$OpenCodePluginFile = Join-Path $ScriptDir '.opencode\plugins\canvas-plugin.js'

try {
    Write-Host ""
    Write-Host "========================================================"
    Write-Host "  Workspace Dinamico - Instalador (Windows)"
    Write-Host "========================================================"

    # --- 0. Verifica pre-requisitos ----------------------------------------
    Write-Section "Pre-requisitos"

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js nao encontrado. Instale em https://nodejs.org/ e rode este script novamente."
    }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        throw "npm nao encontrado (normalmente vem junto com o Node.js)."
    }

    $nodeVersion = (node -v).TrimStart('v')
    $nodeMajor = [int]($nodeVersion.Split('.')[0])
    if ($nodeMajor -lt 18) {
        throw "Node.js 18+ e necessario (detectado: v$nodeVersion). Atualize o Node.js e rode novamente."
    }
    Write-Ok "Node.js v$nodeVersion e npm $(npm -v) encontrados."

    if (-not (Test-Path (Join-Path $CoreDir 'src'))) {
        throw "Pasta 'core-platform\src' nao encontrada ao lado deste script. Rode o instalador a partir da raiz do projeto."
    }
    Write-Ok "Estrutura do projeto localizada em: $ScriptDir"

    # --- 1. CORE (React + Vite) - sempre necessario ------------------------
    Write-Section "1/4 - Core (React + Vite)"

    $corePkgPath = Join-Path $CoreDir 'package.json'
    if (Test-Path $corePkgPath) {
        Write-Warn "core-platform\package.json ja existe - pulando geracao de esqueleto."
    } else {
        $corePkgJson = @'
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
'@
        Write-Utf8NoBom -Path $corePkgPath -Content $corePkgJson
        Write-Ok "core-platform\package.json criado."

        $viteConfigContent = @'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuracao minima do Vite - apenas o plugin de React e necessario.
// O Babel Standalone usado para compilar widgets em runtime e carregado
// via CDN no index.html e nao interfere no build do Vite.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
'@
        Write-Utf8NoBom -Path (Join-Path $CoreDir 'vite.config.js') -Content $viteConfigContent
        Write-Ok "core-platform\vite.config.js criado."

        $indexHtmlContent = @'
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
'@
        Write-Utf8NoBom -Path (Join-Path $CoreDir 'index.html') -Content $indexHtmlContent
        Write-Ok "core-platform\index.html criado (com Tailwind + Babel Standalone via CDN)."

        $mainJsxContent = @'
// main.jsx - ponto de entrada do Vite, monta o App no #root.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@
        Write-Utf8NoBom -Path (Join-Path $CoreDir 'src\main.jsx') -Content $mainJsxContent
        Write-Ok "core-platform\src\main.jsx criado."
    }

    Write-Info "Instalando dependencias do Core (pode levar um minuto)..."
    Push-Location $CoreDir
    try {
        npm install --silent
        if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias do core-platform." }
    } finally {
        Pop-Location
    }
    Write-Ok "Dependencias do Core instaladas."

    # --- 2. Plugin REAL do OpenCode (Bun nativo, sem dependencias) ---------
    Write-Section "2/4 - Plugin do OpenCode (.opencode\plugins\)"

    if (Test-Path $OpenCodePluginFile) {
        Write-Ok "canvas-plugin.js encontrado - nenhuma instalacao necessaria (usa Bun.serve nativo)."
        Write-Host "   Para ativar: abra o OpenCode Desktop/CLI nesta pasta ($ScriptDir),"
        Write-Host "   ou copie o arquivo para `$HOME\.config\opencode\plugins\ (uso global)."
    } else {
        Write-Warn ".opencode\plugins\canvas-plugin.js nao encontrado - pulando esta etapa."
    }

    # --- 3. Pacote REAL do Pi (precisa de npm install para o 'ws') ---------
    Write-Section "3/4 - Pacote do Pi (pi-canvas-package\)"

    if (Test-Path $PiDir) {
        Write-Info "Instalando dependencias do pacote Pi..."
        Push-Location $PiDir
        try {
            npm install --silent
            if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias do pi-canvas-package." }
        } finally {
            Pop-Location
        }
        Write-Ok "Dependencias do pacote Pi instaladas."
        Write-Host "   Para ativar: pi install `"$PiDir`"   (ou 'pi -e' para so testar)"
    } else {
        Write-Warn "pi-canvas-package\ nao encontrado - pulando esta etapa."
    }

    # --- 4. Versao standalone legada (opcional) ----------------------------
    Write-Section "4/4 - Versao standalone legada (opcional)"

    if (Test-Path $LegacyDir) {
        Write-Info "Instalando dependencias da versao standalone (opencode-plugin\)..."
        Push-Location $LegacyDir
        try {
            npm install --silent
            if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias do opencode-plugin." }
        } finally {
            Pop-Location
        }
        Write-Ok "Dependencias da versao standalone instaladas (legado - nao e um plugin real)."
    } else {
        Write-Warn "opencode-plugin\ nao encontrado - pulando esta etapa (tudo bem, e opcional)."
    }

    # --- Conclusao ----------------------------------------------------------
    Write-Host ""
    Write-Host "========================================================"
    Write-Ok "Instalacao concluida!"
    Write-Host "========================================================"
    Write-Host ""
    Write-Host "Para rodar o Core (sempre necessario):"
    Write-Host "  cd `"$CoreDir`"; npm run dev"
    Write-Host "  -> abra o endereco mostrado pelo Vite (geralmente http://localhost:5173)"
    Write-Host ""
    Write-Host "Escolha UM caminho para gerar widgets com IA:"
    Write-Host ""
    Write-Host "  [OpenCode] Abra o OpenCode Desktop/CLI apontando para:"
    Write-Host "             $ScriptDir"
    Write-Host "             (o plugin em .opencode\plugins\ e carregado automaticamente)"
    Write-Host ""
    Write-Host "  [Pi]       pi install `"$PiDir`""
    Write-Host ""
    Write-Host "  [Legado]   cd `"$LegacyDir`"; npm start   (CLI de teste manual, sem IA real)"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}
finally {
    Write-Host "Pressione Enter para fechar..."
    Read-Host | Out-Null
}
