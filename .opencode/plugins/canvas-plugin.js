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
      message(ws, raw) {
        try {
          const msg = JSON.parse(raw);
          if (msg.action === 'WIDGET_EVENT') {
            const { payload } = msg;
            const waiter = replyWaiters.get(payload?.widget_id);
            if (waiter) {
              clearTimeout(waiter.timer);
              replyWaiters.delete(payload.widget_id);
              waiter.resolve(payload);
            }
          }
        } catch (err) {
          console.error('[canvas-plugin] Erro ao processar mensagem do canvas:', err);
        }
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

/** Mapa de promessas: widget_id → { resolve, reject, timer } */
const replyWaiters = new Map();

/**
 * Cria uma promessa que resolve quando chegar WIDGET_EVENT
 * para o widget_id informado, ou rejeita no timeout.
 * @param {string} widgetId
 * @param {number} timeoutMs
 * @returns {Promise<object>}
 */
function waitForReply(widgetId, timeoutMs) {
  if (replyWaiters.has(widgetId)) {
    replyWaiters.get(widgetId).reject(new Error('Substituído por nova chamada'));
    clearTimeout(replyWaiters.get(widgetId).timer);
    replyWaiters.delete(widgetId);
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      replyWaiters.delete(widgetId);
      reject(
        new Error(
          `Timeout: widget "${widgetId}" não respondeu em ${timeoutMs}ms`
        )
      );
    }, timeoutMs);
    replyWaiters.set(widgetId, { resolve, reject, timer });
  });
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
          source_code: tool.schema.string().describe('Código JSX do componente'),
          expect_response: tool.schema
            .boolean()
            .optional()
            .describe(
              'Se true, o tool call aguarda uma resposta do widget antes de resolver'
            ),
          reply_timeout: tool.schema
            .number()
            .optional()
            .describe(
              'Timeout em ms para aguardar resposta (padrão: 30000)'
            ),
        },
        async execute(args) {
          if (!server) {
            return (
              'Erro: o servidor WebSocket do Canvas não está disponível ' +
              '(a porta 8080 pode já estar em uso).'
            );
          }

          const { expect_response, reply_timeout, ...widgetArgs } = args;

          broadcast(server, { action: 'CREATE_WIDGET', payload: widgetArgs });

          await client.app.log({
            body: {
              service: 'canvas-plugin',
              level: 'info',
              message: `Widget "${widgetArgs.title}" enviado ao Canvas`,
              extra: { widget_id: widgetArgs.widget_id, expect_response: !!expect_response },
            },
          });

          if (!expect_response) {
            return `Widget "${widgetArgs.title}" criado e enviado ao Canvas com sucesso.`;
          }

          // Aguarda resposta do canvas
          try {
            const reply = await waitForReply(
              widgetArgs.widget_id,
              reply_timeout ?? 30000
            );
            return `Widget "${widgetArgs.title}" respondeu: ${JSON.stringify(reply.data ?? reply)}`;
          } catch (err) {
            return `Widget "${widgetArgs.title}" não respondeu a tempo: ${err.message}`;
          }
        },
      }),
      canvas_list_widgets: tool({
        description:
          'Lista todos os widgets abertos no Canvas Infinito, com título, ' +
          'tamanho e posição de cada um.',
        args: {},
        async execute() {
          if (!server) return 'Servidor do Canvas indisponível.';

          // Envia pedido e aguarda resposta
          broadcast(server, { action: 'LIST_WIDGETS', payload: {} });

          try {
            const reply = await waitForReply('__system__', 5000);
            const widgets = reply.data ?? [];
            return `Widgets no canvas (${widgets.length}):\n` +
              widgets.map((w) => `  - ${w.title} (${w.id})`).join('\n');
          } catch (err) {
            console.error('[canvas-plugin] canvas_list_widgets timeout:', err);
            return 'Não foi possível obter a lista de widgets (timeout).';
          }
        },
      }),
    },
  };
};
