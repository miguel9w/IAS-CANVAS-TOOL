// .opencode/plugins/canvas-plugin.js
// -----------------------------------------------------------------------
// Plugin REAL do OpenCode — carregado automaticamente pelo OpenCode
// Desktop/CLI a partir de `.opencode/plugins/` (projeto) ou
// `~/.config/opencode/plugins/` (global), conforme a API documentada em
// https://opencode.ai/docs/plugins/
//
// Isso é DIFERENTE da primeira versão deste arquivo (em
// opencode-plugin/plugin.js), que era um script Node standalone rodado
// manualmente via `npm start`, fora do OpenCode. Aquele script usava
// CommonJS (require) e não exportava nada no formato que o OpenCode
// espera — por isso dava "unexpected server error" ao ser carregado
// como plugin de verdade.
//
// Como este plugin funciona:
//   1. Ao ser carregado, sobe um servidor WebSocket NATIVO do Bun na
//      porta 8080 (o Core React continua se conectando normalmente em
//      ws://localhost:8080 — nada muda do lado do front-end).
//   2. Registra uma ferramenta chamada `create_widget`. A própria IA do
//      OpenCode chama essa ferramenta quando quer desenhar algo no
//      Canvas — o OpenCode já valida os argumentos (tipos, campos
//      obrigatórios) antes da nossa função rodar. Isso substitui o
//      antigo `handleAiResponse`/`extractJsonBlock`, que tentava
//      adivinhar um bloco JSON dentro de texto livre da IA — muito mais
//      frágil do que deixar o próprio OpenCode validar os argumentos.
//   3. Quando a ferramenta é chamada, o widget é transmitido a todos os
//      Cores conectados via WebSocket, com a mesma action de sempre:
//      { action: 'CREATE_WIDGET', payload: {...} }.
// -----------------------------------------------------------------------

import { tool } from '@opencode-ai/plugin';

const PORT = 8080;
const TOPIC = 'canvas-widgets';

/**
 * Sobe o servidor WebSocket uma única vez. Usamos `globalThis` como
 * guarda porque o OpenCode pode reinstanciar a função do plugin (ex: ao
 * abrir múltiplas sessões) — não queremos tentar religar a porta 8080
 * de novo e derrubar o processo com EADDRINUSE.
 *
 * @returns {import('bun').Server}
 */
function ensureServer() {
  if (globalThis.__canvasPluginServer) {
    return globalThis.__canvasPluginServer;
  }

  const server = Bun.serve({
    port: PORT,
    fetch(req, srv) {
      // Tenta promover qualquer requisição HTTP recebida para WebSocket.
      if (srv.upgrade(req)) return; // upgrade bem-sucedido: não retorna Response
      return new Response('Canvas Plugin - servidor WebSocket ativo', { status: 200 });
    },
    websocket: {
      open(ws) {
        // Inscreve o novo Core conectado no "canal" de widgets.
        ws.subscribe(TOPIC);
      },
      close(ws) {
        ws.unsubscribe(TOPIC);
      },
      message() {
        // O Core (front-end) não precisa enviar nada de volta por enquanto.
        // Espaço reservado para futuras mensagens Core -> Plugin.
      },
    },
  });

  console.log(`[canvas-plugin] Servidor WebSocket ouvindo em ws://localhost:${PORT}`);
  globalThis.__canvasPluginServer = server;
  return server;
}

/**
 * Transmite uma mensagem para todos os Cores conectados no canal.
 * @param {import('bun').Server} server
 * @param {object} message
 */
function broadcast(server, message) {
  server.publish(TOPIC, JSON.stringify(message));
}

/** @type {import('@opencode-ai/plugin').Plugin} */
export const CanvasPlugin = async ({ client }) => {
  let server;
  try {
    server = ensureServer();
  } catch (err) {
    // Ex: porta 8080 já em uso por outra instância do OpenCode/plugin.
    console.error(`[canvas-plugin] Falha ao subir o servidor WebSocket: ${err.message}`);
  }

  return {
    tool: {
      create_widget: tool({
        description:
          'Cria um widget visual (janela flutuante) no Canvas Infinito. ' +
          'Use sempre que o usuário pedir para mostrar, criar ou desenhar ' +
          'um widget, painel, gráfico, contador, formulário ou qualquer ' +
          'interface visual interativa. O código deve ser um componente ' +
          'React funcional chamado "Widget" que recebe { appBus } via ' +
          'props, escrito em JSX (é compilado no navegador em tempo real ' +
          'via Babel Standalone, então não use imports externos).',
        args: {
          widget_id: tool.schema
            .string()
            .describe('Identificador único do widget, ex: "contador-1"'),
          title: tool.schema.string().describe('Título exibido na barra da janela'),
          width: tool.schema.number().describe('Largura da janela em pixels'),
          height: tool.schema.number().describe('Altura da janela em pixels'),
          source_code: tool.schema
            .string()
            .describe(
              'Código JSX do componente. Deve declarar: function Widget({ appBus }) { ... }'
            ),
        },
        async execute(args) {
          if (!server) {
            return (
              'Erro: o servidor WebSocket do Canvas não está disponível ' +
              '(a porta 8080 pode já estar em uso). Verifique os logs do OpenCode.'
            );
          }

          broadcast(server, { action: 'CREATE_WIDGET', payload: args });

          // Log estruturado — aparece nos logs do OpenCode Desktop/CLI.
          await client.app.log({
            body: {
              service: 'canvas-plugin',
              level: 'info',
              message: `Widget "${args.title}" enviado ao Canvas`,
              extra: { widget_id: args.widget_id },
            },
          });

          return `Widget "${args.title}" criado e enviado ao Canvas com sucesso.`;
        },
      }),
    },
  };
};
