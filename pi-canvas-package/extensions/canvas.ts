// extensions/canvas.ts
// -----------------------------------------------------------------------
// Pi Package: Canvas Infinito
//
// Extensão do Pi que integra o agente de IA com o Canvas Infinito (Core
// React) através de uma ferramenta customizada (`create_widget`) e um
// servidor WebSocket na porta 8080.
//
// Referências usadas: https://pi.dev/docs/latest/extensions
//                      https://pi.dev/docs/latest/packages
// -----------------------------------------------------------------------

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "typebox";
import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;

let wss: WebSocketServer | undefined;
const clients = new Set<WebSocket>();

/**
 * Sobe o servidor WebSocket. Chamado a partir de `session_start` — NUNCA
 * diretamente na função de fábrica da extensão. O Pi pode invocar a
 * fábrica em execuções que nunca chegam a iniciar uma sessão (ex:
 * `pi --list-models`), e não queremos abrir sockets nesses casos.
 * Idempotente: `session_start` pode disparar várias vezes (reload, /new,
 * /resume, /fork).
 */
function ensureServer(ctx: ExtensionContext): void {
  if (wss) return;

  try {
    wss = new WebSocketServer({ port: PORT });
    wss.on("connection", (socket) => {
      clients.add(socket);
      socket.on("close", () => clients.delete(socket));
    });
    wss.on("error", (err: Error) => {
      ctx.ui.notify(`Canvas: erro no servidor WebSocket - ${err.message}`, "error");
    });
    ctx.ui.notify(`Canvas: servidor WebSocket em ws://localhost:${PORT}`, "info");
  } catch (err) {
    ctx.ui.notify(
      `Canvas: falha ao subir o servidor WebSocket (porta ${PORT} em uso?) - ${(err as Error).message}`,
      "error",
    );
  }
}

/** Encerra o servidor e desconecta todos os clientes conectados. */
function shutdownServer(): void {
  for (const socket of clients) socket.close();
  clients.clear();
  wss?.close();
  wss = undefined;
}

/** Transmite uma mensagem para todos os Cores (abas do navegador) conectados. */
function broadcast(message: unknown): void {
  const raw = JSON.stringify(message);
  for (const socket of clients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(raw);
  }
}

const createWidgetSchema = Type.Object({
  widget_id: Type.String({ description: 'Identificador único do widget, ex: "contador-1"' }),
  title: Type.String({ description: "Título exibido na barra da janela" }),
  width: Type.Number({ description: "Largura da janela em pixels" }),
  height: Type.Number({ description: "Altura da janela em pixels" }),
  source_code: Type.String({
    description: 'Código JSX do componente. Deve declarar: function Widget({ appBus }) { ... }',
  }),
});

export type CreateWidgetParams = Static<typeof createWidgetSchema>;

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ensureServer(ctx);
  });

  pi.on("session_shutdown", async () => {
    shutdownServer();
  });

  pi.registerTool({
    name: "create_widget",
    label: "Create Canvas Widget",
    description:
      "Cria um widget visual (janela flutuante) no Canvas Infinito. Use sempre que o " +
      "usuário pedir para mostrar, criar ou desenhar um widget, painel, gráfico, contador, " +
      'formulário ou qualquer interface visual interativa. O código deve ser um componente ' +
      'React funcional chamado "Widget" que recebe { appBus } via props, escrito em JSX puro ' +
      "(compilado no navegador via Babel Standalone - não use imports externos).",
    promptSnippet: "Cria um widget visual no Canvas Infinito a partir de código JSX",
    promptGuidelines: [
      'Use create_widget quando o usuário pedir para "mostrar", "criar" ou "desenhar" algo ' +
        "visual no canvas - não escreva o JSON manualmente na resposta de texto.",
    ],
    parameters: createWidgetSchema,
    async execute(_toolCallId, params: CreateWidgetParams, _signal, _onUpdate, ctx) {
      if (!wss) {
        ensureServer(ctx);
      }
      if (!wss) {
        throw new Error("Servidor WebSocket do Canvas indisponível (porta 8080 em uso?).");
      }

      broadcast({ action: "CREATE_WIDGET", payload: params });

      return {
        content: [{ type: "text", text: `Widget "${params.title}" criado e enviado ao Canvas.` }],
        details: { widget_id: params.widget_id },
      };
    },
  });
}
