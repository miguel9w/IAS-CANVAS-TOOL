// App.jsx
// -----------------------------------------------------------------------
// Componente raiz da Plataforma Core (Canvas Infinito). Responsabilidades:
//
//   1. Manter o estado global de janelas (`windows`) — cada uma com
//      { id, title, width, height, x, y, source_code, zIndex }.
//   2. Escutar o WebSocket do Plugin OpenCode (porta 8080) via
//      useWebSocket e criar/atualizar widgets quando a action
//      CREATE_WIDGET chega.
//   3. Renderizar o Canvas e delegar cada janela ao FloatingWindow, que
//      por sua vez delega o CONTEÚDO ao WidgetWrapper.
//
// O "Canvas Infinito" é implementado de forma simples: uma camada maior
// que a viewport, transladada via CSS transform (pan com o botão do meio
// do mouse). Cada janela vive em coordenadas absolutas dentro dessa camada.
// -----------------------------------------------------------------------

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useWebSocket } from './useWebSocket';
import { appBus } from './eventBus';
import FloatingWindow from './FloatingWindow';

const WS_URL = 'ws://localhost:8080';

// Deslocamento em cascata para que novas janelas não nasçam exatamente
// empilhadas na mesma posição.
const CASCADE_OFFSET = 32;
const CASCADE_LIMIT = 10;

// Contador global de z-index — cresce a cada foco/criação de janela,
// garantindo que a última interagida sempre fique por cima.
let zIndexCounter = 1;

export default function App() {
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Pan (deslocamento) do canvas infinito.
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panState = useRef(null);

  // --- Criação de janelas a partir de payloads do WebSocket ---------------
  const createWindowFromPayload = useCallback((payload) => {
    setWindows((prev) => {
      const index = prev.length % CASCADE_LIMIT;
      const newWindow = {
        id: payload.widget_id ?? crypto.randomUUID(),
        title: payload.title ?? 'Widget sem título',
        width: payload.width ?? 420,
        height: payload.height ?? 320,
        x: payload.x ?? 80 + index * CASCADE_OFFSET,
        y: payload.y ?? 80 + index * CASCADE_OFFSET,
        source_code: payload.source_code,
        zIndex: ++zIndexCounter,
      };
      return [...prev, newWindow];
    });
  }, []);

  // --- Handler central de mensagens vindas do Plugin OpenCode -------------
  const handleSocketMessage = useCallback(
    (message) => {
      if (!message || typeof message !== 'object') return;

      switch (message.action) {
        case 'CREATE_WIDGET': {
          const { payload } = message;
          if (!payload?.source_code) {
            console.warn('[App] CREATE_WIDGET recebido sem "source_code", ignorando:', message);
            return;
          }
          createWindowFromPayload(payload);
          break;
        }
        // Espaço reservado para futuras actions: UPDATE_WIDGET, CLOSE_WIDGET, etc.
        default:
          console.warn('[App] Action desconhecida recebida do plugin:', message.action);
      }
    },
    [createWindowFromPayload]
  );

  const { status: wsStatus } = useWebSocket(WS_URL, { onMessage: handleSocketMessage });

  // --- Manipulação de janelas ----------------------------------------------
  const focusWindow = useCallback((id) => {
    setActiveId(id);
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: ++zIndexCounter } : w)));
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const dragWindow = useCallback((id, x, y) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resizeWindow = useCallback((id, width, height) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)));
  }, []);

  // --- Pan do fundo do canvas (arrastar segurando o botão do meio) --------
  const handleCanvasMouseDown = useCallback(
    (e) => {
      if (e.button !== 1) return; // apenas o botão do meio do mouse
      e.preventDefault();
      panState.current = { startX: e.clientX, startY: e.clientY, originPan: pan };

      const handleMove = (moveEvent) => {
        if (!panState.current) return;
        const dx = moveEvent.clientX - panState.current.startX;
        const dy = moveEvent.clientY - panState.current.startY;
        setPan({ x: panState.current.originPan.x + dx, y: panState.current.originPan.y + dy });
      };
      const handleUp = () => {
        panState.current = null;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [pan]
  );

  const statusColor = useMemo(() => {
    if (wsStatus === 'open') return 'bg-teal-400';
    if (wsStatus === 'connecting') return 'bg-amber-400 animate-pulse';
    return 'bg-red-500';
  }, [wsStatus]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B1120] text-slate-200">
      {/* Grade de fundo — puramente decorativa, reforça a metáfora de canvas técnico */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          transform: `translate(${pan.x % 24}px, ${pan.y % 24}px)`,
        }}
      />

      {/* Indicador de status da conexão com o Plugin OpenCode */}
      <div className="absolute top-3 right-4 z-50 flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-[#121826]/80 border border-slate-800 rounded-full px-3 py-1.5 backdrop-blur">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        {wsStatus === 'open' && 'plugin conectado · porta 8080'}
        {wsStatus === 'connecting' && 'conectando ao plugin...'}
        {wsStatus === 'closed' && 'plugin desconectado · tentando reconectar'}
      </div>

      {/* Área pannable do canvas infinito */}
      <div className="absolute inset-0" onMouseDown={handleCanvasMouseDown} style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
        {windows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm font-mono pointer-events-none">
            Nenhum widget ativo. Aguardando comandos do OpenCode...
          </div>
        )}

        {windows.map((win) => (
          <FloatingWindow
            key={win.id}
            win={win}
            appBus={appBus}
            isActive={activeId === win.id}
            onFocus={focusWindow}
            onClose={closeWindow}
            onDrag={dragWindow}
            onResize={resizeWindow}
          />
        ))}
      </div>
    </div>
  );
}
