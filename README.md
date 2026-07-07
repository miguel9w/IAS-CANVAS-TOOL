# Workspace Dinâmico com Canvas Infinito

Plataforma de canvas infinito com janelas flutuantes, onde widgets React são
gerados dinamicamente por uma IA e renderizados no navegador em tempo real —
sem etapa de build para o conteúdo dos widgets. Suporta **três** caminhos de
integração com agentes de IA: **OpenCode** (plugin real), **Pi** (pacote real)
e uma versão **standalone** legada para testes manuais sem IA nenhuma.

## Arquitetura

```
                                   ┌──────────────────────────────┐
                                   │   CORE (React + Vite)         │
                                   │   core-platform/               │
                                   │                                │
                                   │   App.jsx                      │
                                   │    └─ useWebSocket             │
                                   │    └─ FloatingWindow (N)        │
                                   │         └─ WidgetWrapper        │
                                   │              └─ Babel Standalone │
                                   └───────────────┬────────────────┘
                                                    │ WebSocket :8080
                                                    │ { action: 'CREATE_WIDGET',
                                                    │   payload: {...} }
                        ┌───────────────────────────┼───────────────────────────┐
                        │                            │                            │
              ┌─────────▼─────────┐        ┌─────────▼─────────┐      ┌──────────▼─────────┐
              │  OpenCode (real)   │        │    Pi (real)       │      │  Standalone (legado) │
              │ .opencode/plugins/ │        │ pi-canvas-package/  │      │  opencode-plugin/    │
              │ canvas-plugin.js   │        │ extensions/canvas.ts│      │  plugin.js           │
              │                    │        │                     │      │                      │
              │ Bun.serve nativo   │        │ Node + ws (npm)     │      │ Node + ws (npm)      │
              │ tool create_widget │        │ tool create_widget  │      │ CLI de teste manual  │
              │ carregado auto.    │        │ pi install ...      │      │ (sem IA real)         │
              └────────────────────┘        └─────────────────────┘      └──────────────────────┘
```

- **Core**: gerencia o estado das janelas, o canvas pannable, o barramento de
  eventos (`appBus`) e a compilação em runtime do JSX recebido. É o mesmo,
  não importa qual dos três caminhos abaixo você use.
- **OpenCode** e **Pi** são agentes de código de terminal diferentes, cada um
  com sua própria API de extensões. Os dois plugins fazem a mesma coisa
  (registram uma ferramenta `create_widget` que a IA chama, e transmitem o
  widget ao Core via WebSocket) mas usando a API nativa de cada ferramenta.
- **Standalone** é um script Node manual (sem IA real) para testar o Core
  isoladamente via uma CLI que simula respostas de IA.

## Estrutura de pastas

```
opencode-canvas/
├── README.md                       # este arquivo
├── install.sh                      # instalador Linux/macOS (Core + os 3 plugins)
├── install.ps1                     # instalador Windows (idem)
│
├── core-platform/                  # Core React + Vite (sempre necessário)
│   ├── public/widgets-database/    # catálogo de widgets pré-instalados
│   └── src/
│       ├── App.jsx                 # estado das janelas, canvas, WebSocket
│       ├── FloatingWindow.jsx      # moldura da janela (drag/resize/close)
│       ├── WidgetWrapper.jsx       # compila e renderiza o JSX dinâmico
│       ├── Sidebar.jsx             # menu lateral (demo, custom, biblioteca)
│       ├── eventBus.js             # appBus — EventEmitter simples (pub/sub)
│       └── useWebSocket.js         # hook de conexão com reconexão automática
│
├── .opencode/
│   └── plugins/
│       └── canvas-plugin.js        # plugin REAL do OpenCode (Bun.serve nativo)
│
├── pi-canvas-package/               # pacote REAL do Pi
│   ├── package.json
│   └── extensions/
│       └── canvas.ts                # extensão Pi (TypeScript + ws)
│
├── opencode-plugin/                  # versão standalone antiga (legado)
│   ├── plugin.js
│   └── package.json
│
├── widgets-database/                # fonte dos widgets do catálogo
│   ├── games/ finance/ geography/ math/ physics/ text/ time/ utils/
│   └── ...
│
├── docs/
│   └── superpowers/
│       ├── specs/                   # design docs
│       └── plans/                   # planos de implementação
│
└── .superpowers/                    # cache de execução (gitignorado)
```

## Instalação

Rode o instalador correspondente ao seu sistema **a partir da raiz do
projeto** (onde este README está). Ele prepara as quatro partes de uma vez:
gera o esqueleto Vite do Core, instala as dependências do Core, do pacote Pi
e da versão standalone legada (o plugin do OpenCode não precisa de nada — usa
`Bun.serve` nativo). É idempotente: rodar de novo não sobrescreve nada.

**Linux / macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```
(ou clique com o botão direito em `install.ps1` → "Executar com o
PowerShell". Se o Windows bloquear por política de execução, rode antes
`Unblock-File -Path .\install.ps1`.)

Ao final, o script imprime os comandos para rodar o Core e para ativar cada
um dos três caminhos de integração.

## Rodando o Core

```bash
cd core-platform
npm run dev
```

Abra o endereço mostrado pelo Vite (geralmente `http://localhost:5173`).

## Caminho 1 — OpenCode (recomendado, plugin real)

O arquivo `.opencode/plugins/canvas-plugin.js` já está na estrutura correta
para o OpenCode carregar automaticamente. Só abra o **OpenCode Desktop/CLI
apontando para a raiz deste projeto** (a pasta que contém `.opencode/`).

Para usar globalmente em qualquer projeto, copie o arquivo para
`~/.config/opencode/plugins/` (Linux/macOS) ou
`%USERPROFILE%\.config\opencode\plugins\` (Windows — caminho não 100%
confirmado na prática, veja a seção de testes abaixo).

Peça à IA algo como *"crie um widget de contador no canvas"* — ela deve
chamar a ferramenta `create_widget` automaticamente.

## Caminho 2 — Pi (plugin real)

```bash
cd pi-canvas-package
npm install          # já feito pelo install.sh/ps1, mas garante se rodar manual
pi -e .               # testar sem instalar
pi install .          # instalar de vez (global, ~/.pi/agent/settings.json)
pi install -l .        # instalar só neste projeto (.pi/settings.json)
```

## Caminho 3 — Standalone (legado, sem IA real)

Só para testar o Core isoladamente:

```bash
cd opencode-plugin
npm start
```

Abre uma CLI (`opencode>`) que simula uma resposta de IA com um widget de
contador ao digitar qualquer texto.

## Convenção do widget (`source_code`)

Igual nos três caminhos — o componente deve se chamar `Widget`, receber
`appBus` via props, e não usar imports externos além de `react` (é compilado
no navegador via Babel Standalone):

```jsx
function Widget({ appBus }) {
  return <div>Olá, canvas!</div>;
}
```

`import`/`export` do próprio `react` são tolerados (o `WidgetWrapper.jsx` os
resolve internamente) — outras bibliotecas não estão disponíveis.

## API bidirecional widget ↔ IA

Além do `appBus` para comunicação entre widgets, dois eventos reservados
permitem que o widget converse com a IA que o criou:

### widget → IA: `appBus.emit('ai:emit', data)`

```jsx
appBus.emit('ai:emit', {
  widget_id: 'meu-form',          // obrigatório — mesmo passado no create_widget
  type: 'form_submit',            // identificador livre do evento
  data: { nome: 'João', email: 'joao@email.com' }
});
```

O tool call da IA que criou este widget com `expect_response: true`
receberá este dado e poderá processá-lo.

### IA → widget: `appBus.on('ai:command:<id>', handler)`

```jsx
React.useEffect(() => {
  return appBus.on('ai:command:meu-form', (cmd) => {
    if (cmd.command === 'reset') {
      setNome('');
      setEmail('');
    }
    if (cmd.command === 'query_state') {
      appBus.emit('ai:emit', {
        widget_id: 'meu-form',
        type: 'state_response',
        data: { nome, email }
      });
    }
  });
}, []);
```

### Ações do protocolo

| Action | Direção | Descrição |
|--------|---------|-----------|
| `CREATE_WIDGET` | IA → Canvas | Criar widget (existente) |
| `UPDATE_WIDGET` | IA → Canvas | Alterar widget ativo |
| `CLOSE_WIDGET` | IA → Canvas | Fechar widget |
| `LIST_WIDGETS` | IA → Canvas | Listar widgets abertos |
| `QUERY_STATE` | IA → Canvas | Pedir estado de um widget |
| `WIDGET_COMMAND` | IA → Canvas | Comando direto a um widget |
| `WIDGET_EVENT` | Canvas → IA | Widget envia dados de volta |

## Formato da mensagem CREATE_WIDGET (WebSocket, igual nos 3 caminhos)

```json
{
  "action": "CREATE_WIDGET",
  "payload": {
    "widget_id": "contador-1",
    "title": "Contador de Teste",
    "width": 320,
    "height": 220,
    "source_code": "function Widget({ appBus }) { ... }"
  }
}
```
## Bugs reais que já apareceram e foram corrigidos (histórico)

Caso você tenha uma cópia antiga destes arquivos, aqui está o que mudou:

1. **BOM no `package.json` gerado pelo Windows PowerShell** — `Set-Content
   -Encoding UTF8` no PowerShell 5.1 grava um BOM que quebra `JSON.parse`.
   Corrigido usando `[System.IO.File]::WriteAllText(...)` com
   `UTF8Encoding($false)` em vez de `Set-Content`.
2. **`Cannot use import statement outside a module`** — a IA às vezes escreve
   `import { useState } from 'react'` no código do widget. Corrigido
   adicionando o plugin `transform-modules-commonjs` do Babel + um `require`
   mínimo que só resolve `'react'`.
3. **`Import não suportado: "react/jsx-runtime"`** — o preset `react` do
   Babel usa por padrão o "automatic runtime", que insere esse import em
   **todo** JSX, mesmo sem a IA escrever nada. Corrigido forçando
   `runtime: 'classic'` no preset (gera `React.createElement` puro, sem
   nenhum import).

## Notas de segurança

- `new Function(...)` (em `WidgetWrapper.jsx`) isola **escopo** — o widget só
  enxerga `React`, `appBus` e um `require` limitado — mas não é um sandbox de
  segurança real; o código roda com os mesmos privilégios da página. Para
  IAs/plugins não confiáveis, o próximo passo seria mover a execução para um
  `<iframe sandbox>` ou Web Worker.
- Erros de sintaxe (Babel) e erros de renderização (React) são tratados
  separadamente em `WidgetWrapper.jsx`, para que um widget quebrado nunca
  derrube o Canvas inteiro.

## Entregues

- Botão para **salvar** widget em arquivo local e **carregar** de arquivo
  (via File System Access API / Sidebar)
- **API bidirecional** com streaming: widget ↔ IA via `appBus.emit('ai:emit')`
  e `appBus.on('ai:command:<id>', ...)`
