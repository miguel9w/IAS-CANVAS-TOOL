// useWebSocket.js
// -----------------------------------------------------------------------
// Hook responsável por manter a conexão com o Plugin OpenCode, que roda
// localmente como um servidor WebSocket (porta 8080). Trata reconexão
// automática com backoff exponencial, já que o plugin pode ser reiniciado
// (ou a CLI encerrada) de forma independente do navegador.
// -----------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from 'react';

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15000;

/**
 * @param {string} url - ex: 'ws://localhost:8080'
 * @param {{ onMessage: (data: object) => void }} handlers
 * @returns {{ status: 'connecting'|'open'|'closed', send: (data: object) => void }}
 */
export function useWebSocket(url, { onMessage }) {
  const [status, setStatus] = useState('connecting');
  const wsRef = useRef(null);
  const attemptRef = useRef(0);

  // Guardamos a callback mais recente em uma ref para não precisar
  // reabrir a conexão toda vez que `onMessage` mudar de identidade
  // (o que aconteceria a cada re-render do componente pai).
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer = null;

    function connect() {
      setStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        attemptRef.current = 0;
        setStatus('open');
        console.log(`[useWebSocket] Conectado ao Plugin OpenCode em ${url}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (err) {
          console.error('[useWebSocket] Mensagem recebida não é um JSON válido:', err);
        }
      };

      ws.onerror = (err) => {
        // O evento onclose é disparado logo em seguida, onde tratamos a reconexão.
        console.error('[useWebSocket] Erro na conexão WebSocket:', err);
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus('closed');

        const delay = Math.min(
          RECONNECT_BASE_DELAY_MS * 2 ** attemptRef.current,
          RECONNECT_MAX_DELAY_MS
        );
        attemptRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [url]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[useWebSocket] Tentativa de envio com o socket fechado, mensagem descartada.');
    }
  }, []);

  return { status, send };
}
