#!/usr/bin/env node
/**
 * plugin.js
 * -----------------------------------------------------------------------
 * Plugin OpenCode — roda como um processo Node.js local, lado a lado com
 * a CLI do OpenCode na máquina do usuário. Responsabilidades:
 *
 *   1. Subir um servidor WebSocket na porta 8080, ao qual o Core React
 *      (rodando no navegador) se conecta.
 *   2. Interceptar o texto bruto retornado pela IA (`handleAiResponse`),
 *      extrair um bloco JSON válido descrevendo um Widget, validar seus
 *      campos obrigatórios e transmiti-lo ao Core como uma mensagem
 *      { action: 'CREATE_WIDGET', payload: {...} }.
 *   3. Oferecer uma CLI simples (readline) para testar esse fluxo
 *      manualmente, sem depender de uma IA real conectada.
 * -----------------------------------------------------------------------
 */

'use strict';

const { WebSocketServer } = require('ws');
const readline = require('readline');

// -------------------------------------------------------------------------
// 1. SERVIDOR WEBSOCKET
// -------------------------------------------------------------------------

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

/** Conjunto de clientes (abas do Core React) atualmente conectados. */
const clients = new Set();

wss.on('connection', (socket) => {
  clients.add(socket);
  console.log(`[plugin] Core conectado. Clientes ativos: ${clients.size}`);

  socket.on('close', () => {
    clients.delete(socket);
    console.log(`[plugin] Core desconectado. Clientes ativos: ${clients.size}`);
  });

  socket.on('error', (err) => {
    console.error('[plugin] Erro no socket de um cliente:', err.message);
  });
});

console.log(`[plugin] Servidor WebSocket do OpenCode ouvindo em ws://localhost:${PORT}`);

/**
 * Transmite uma mensagem para todos os Cores (abas do navegador) conectados.
 * @param {object} message
 */
function broadcast(message) {
  const raw = JSON.stringify(message);
  for (const socket of clients) {
    if (socket.readyState === 1 /* OPEN */) {
      socket.send(raw);
    }
  }
}

// -------------------------------------------------------------------------
// 2. INTERCEPTADOR DE RESPOSTAS DA IA
// -------------------------------------------------------------------------

/** Campos obrigatórios para que um objeto seja considerado um Widget válido. */
const REQUIRED_WIDGET_FIELDS = ['widget_id', 'title', 'width', 'height', 'source_code'];

/**
 * Tenta localizar e extrair um bloco JSON de dentro de um texto livre.
 * A resposta de uma IA costuma vir com explicações em prosa, markdown,
 * etc. ao redor do JSON de fato.
 *
 * Estratégia em duas etapas:
 *   1. Procura um bloco cercado por ```json ... ``` (formato comum em
 *      respostas de LLMs).
 *   2. Caso não encontre (ou o bloco cercado não seja um JSON válido),
 *      cai para uma busca do primeiro '{' ao último '}' da string —
 *      funciona bem quando a IA responde só com JSON, ou com pouco
 *      texto ao redor dele.
 *
 * @param {string} rawText
 * @returns {object|null} objeto parseado, ou null se nada válido foi encontrado
 */
function extractJsonBlock(rawText) {
  if (typeof rawText !== 'string') return null;

  // Tentativa 1: bloco de código markdown ```json ... ```
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch (_err) {
      // Segue para a próxima estratégia
    }
  }

  // Tentativa 2: do primeiro '{' ao último '}' da string inteira
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = rawText.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (_err) {
      // JSON malformado — não há mais nada razoável a tentar
    }
  }

  return null;
}

/**
 * Valida se um objeto possui todos os campos obrigatórios de um Widget.
 * @param {object} obj
 * @returns {{ valid: boolean, missing: string[] }}
 */
function validateWidgetSchema(obj) {
  const missing = REQUIRED_WIDGET_FIELDS.filter((field) => !(field in obj));
  return { valid: missing.length === 0, missing };
}

/**
 * Ponto de entrada principal do interceptador: recebe o texto bruto
 * retornado pela IA, tenta extrair e validar um Widget e, se tudo estiver
 * correto, o transmite ao Core React via WebSocket.
 *
 * @param {string} rawText - resposta bruta da IA (pode conter texto + JSON)
 * @returns {{ success: boolean, reason?: string, widget?: object }}
 */
function handleAiResponse(rawText) {
  const extracted = extractJsonBlock(rawText);

  if (!extracted) {
    const reason = 'Nenhum bloco JSON válido foi encontrado na resposta da IA.';
    console.warn(`[plugin] ${reason}`);
    return { success: false, reason };
  }

  const { valid, missing } = validateWidgetSchema(extracted);
  if (!valid) {
    const reason = `JSON encontrado, mas faltam campos obrigatórios: ${missing.join(', ')}`;
    console.warn(`[plugin] ${reason}`);
    return { success: false, reason };
  }

  // Normaliza os tipos antes de enviar — nunca confie cegamente no que a IA devolveu.
  const payload = {
    widget_id: String(extracted.widget_id),
    title: String(extracted.title),
    width: Number(extracted.width),
    height: Number(extracted.height),
    source_code: String(extracted.source_code),
  };

  broadcast({ action: 'CREATE_WIDGET', payload });
  console.log(`[plugin] Widget "${payload.title}" (${payload.widget_id}) enviado ao Core.`);

  return { success: true, widget: payload };
}

// -------------------------------------------------------------------------
// 3. CLI SIMULADA (readline)
// -------------------------------------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'opencode> ',
});

/**
 * Simula a resposta ESTRUTURADA que a IA enviaria para um comando do
 * usuário. Em produção esse texto viria da chamada real à API de IA;
 * aqui geramos um exemplo determinístico para testes locais, sem
 * depender de rede ou de uma chave de API.
 *
 * @param {string} userCommand
 * @returns {string} texto bruto simulando uma resposta de IA
 */
function simulateAiResponse(userCommand) {
  const widgetId = `widget-${Date.now()}`;

  // Widget de exemplo: um contador simples que usa o appBus para
  // notificar outros widgets quando o valor muda.
  const sourceCode = `
function Widget({ appBus }) {
  const [count, setCount] = React.useState(0);

  const increment = () => {
    const next = count + 1;
    setCount(next);
    appBus.emit('counter:changed', { value: next });
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace', color: '#e2e8f0' }}>
      <p>Comando recebido: "${userCommand.replace(/"/g, "'")}"</p>
      <p style={{ fontSize: '24px', margin: '12px 0' }}>{count}</p>
      <button
        onClick={increment}
        style={{ background: '#2DD4BF', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
      >
        Incrementar
      </button>
    </div>
  );
}
`.trim();

  // Simula uma resposta "realista": texto explicativo da IA + bloco JSON
  // cercado por markdown, como um LLM normalmente devolve.
  return [
    'Claro! Criei um widget de contador simples para você.',
    '```json',
    JSON.stringify(
      { widget_id: widgetId, title: 'Contador de Teste', width: 320, height: 220, source_code: sourceCode },
      null,
      2
    ),
    '```',
  ].join('\n');
}

console.log('\n=== CLI de teste do Plugin OpenCode ===');
console.log('Digite qualquer comando para simular uma resposta da IA.');
console.log('Digite "sair" para encerrar a CLI.\n');

rl.prompt();

rl.on('line', (line) => {
  const command = line.trim();

  if (!command) {
    rl.prompt();
    return;
  }

  if (command.toLowerCase() === 'sair') {
    rl.close();
    return;
  }

  console.log(`[cli] Enviando comando para a IA (simulado): "${command}"`);
  const aiRawResponse = simulateAiResponse(command);
  const result = handleAiResponse(aiRawResponse);

  if (result.success) {
    console.log('[cli] ✅ Widget criado e transmitido ao Core.\n');
  } else {
    console.log(`[cli] ❌ Falha ao processar resposta da IA: ${result.reason}\n`);
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('\n[plugin] CLI encerrada. O servidor WebSocket continua ativo (Ctrl+C para sair totalmente).');
});

// -------------------------------------------------------------------------
// Exporta as funções principais para permitir testes unitários externos
// -------------------------------------------------------------------------
module.exports = {
  handleAiResponse,
  extractJsonBlock,
  validateWidgetSchema,
  broadcast,
};
