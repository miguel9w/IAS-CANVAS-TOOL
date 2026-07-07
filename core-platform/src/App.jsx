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

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { appBus } from './eventBus';
import FloatingWindow from './FloatingWindow';
import Sidebar from './Sidebar';

const WS_URL = 'ws://localhost:8080';

const CASCADE_OFFSET = 32;
const CASCADE_LIMIT = 10;

let zIndexCounter = 1;

const DEMO_WIDGETS = [
  {
    widget_id: 'demo-contador',
    title: 'Contador',
    width: 300, height: 200,
    x: 80, y: 80,
    source_code: `function Widget({ appBus }) {
  var count = React.useState(0);
  return React.createElement('div', { style: { padding: 24, textAlign: 'center' } },
    React.createElement('h2', { style: { marginBottom: 16, color: '#e2e8f0' } }, 'Contador: ' + count[0]),
    React.createElement('button', {
      onClick: function() { count[1](count[0] + 1); },
      style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', marginRight: 8, cursor: 'pointer', fontSize: 18 }
    }, '+'),
    React.createElement('button', {
      onClick: function() { count[1](count[0] - 1); },
      style: { background: '#475569', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 18 }
    }, '-')
  );
}`
  },
  {
    widget_id: 'demo-relogio',
    title: 'Relógio',
    width: 280, height: 160,
    x: 420, y: 80,
    source_code: `function Widget({ appBus }) {
  var hora = React.useState(new Date().toLocaleTimeString('pt-BR'));
  React.useEffect(function() {
    var id = setInterval(function() { hora[1](new Date().toLocaleTimeString('pt-BR')); }, 1000);
    return function() { clearInterval(id); };
  }, []);
  return React.createElement('div', { style: { padding: 24, textAlign: 'center' } },
    React.createElement('div', { style: { fontSize: 13, color: '#94a3b8', marginBottom: 8 } }, 'Hora atual'),
    React.createElement('div', { style: { fontSize: 32, fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' } }, hora[0])
  );
}`
  },
  {
    widget_id: 'demo-notas',
    title: 'Bloco de Notas',
    width: 320, height: 260,
    x: 80, y: 320,
    source_code: `function Widget({ appBus }) {
  var texto = React.useState('');
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement('textarea', {
      value: texto[0],
      onChange: function(e) { texto[1](e.target.value); },
      placeholder: 'Digite algo...',
      style: { width: '100%', height: 140, background: '#1a1f2e', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: 12, fontSize: 14, resize: 'none', fontFamily: 'inherit' }
    }),
    React.createElement('p', { style: { marginTop: 8, fontSize: 12, color: '#64748b', textAlign: 'right' } }, 'Caracteres: ' + texto[0].length)
  );
}`
  },
  {
    widget_id: 'demo-cor',
    title: 'Seletor de Cor',
    width: 260, height: 200,
    x: 440, y: 320,
    source_code: `function Widget({ appBus }) {
  var cor = React.useState('#6366f1');
  return React.createElement('div', { style: { padding: 20, textAlign: 'center' } },
    React.createElement('div', { style: { width: 80, height: 80, background: cor[0], borderRadius: 12, margin: '0 auto 12px', border: '3px solid #334155' } }),
    React.createElement('input', {
      type: 'color',
      value: cor[0],
      onChange: function(e) { cor[1](e.target.value); },
      style: { width: 60, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }
    })
  );
}`
  },
  {
    widget_id: 'demo-tarefas',
    title: 'Lista de Tarefas',
    width: 340, height: 300,
    x: 80, y: 620,
    source_code: `function Widget({ appBus }) {
  var tarefas = React.useState([]);
  var input = React.useState('');
  function adicionar() {
    if (input[0].trim()) {
      tarefas[1]([].concat(tarefas[0], [{ text: input[0], feita: false }]));
      input[1]('');
    }
  }
  function toggle(i) {
    var nova = tarefas[0].slice();
    nova[i] = { text: nova[i].text, feita: !nova[i].feita };
    tarefas[1](nova);
  }
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 12 } },
      React.createElement('input', {
        value: input[0],
        onChange: function(e) { input[1](e.target.value); },
        onKeyDown: function(e) { if (e.key === 'Enter') adicionar(); },
        placeholder: 'Nova tarefa...',
        style: { flex: 1, background: '#1a1f2e', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '6px 10px', fontSize: 13 }
      }),
      React.createElement('button', {
        onClick: adicionar,
        style: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
      }, '+')
    ),
    React.createElement('div', null,
      tarefas[0].length === 0
        ? React.createElement('p', { style: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 20 } }, 'Nenhuma tarefa ainda')
        : tarefas[0].map(function(t, i) {
            return React.createElement('div', {
              key: i,
              onClick: function() { toggle(i); },
              style: { padding: '6px 8px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', background: t.feita ? 'rgba(52,211,153,0.08)' : 'transparent', color: t.feita ? '#6ee7b7' : '#e2e8f0', fontSize: 13, textDecoration: t.feita ? 'line-through' : 'none' }
            }, (t.feita ? '\u2713 ' : '') + t.text);
          })
    )
  );
}`
  },
  {
    widget_id: 'demo-grafico',
    title: 'Barras (Mock)',
    width: 300, height: 220,
    x: 460, y: 620,
    source_code: `function Widget({ appBus }) {
  var dados = [42, 78, 35, 91, 56, 68];
  var cores = ['#6366f1', '#a5b4fc', '#6ee7b7', '#fcd34d', '#f472b6', '#fb923c'];
  var nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 } },
      dados.map(function(v, i) {
        return React.createElement('div', {
          key: i,
          title: nomes[i] + ': ' + v,
          style: { flex: 1, height: v + '%', background: cores[i % cores.length], borderRadius: '4px 4px 0 0', minHeight: 8, transition: 'height 0.3s', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: 10, color: '#0B1120', fontWeight: 700, paddingBottom: 2 }
        }, v);
      })
    ),
    React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 6 } },
      nomes.map(function(n, i) {
        return React.createElement('div', { key: i, style: { flex: 1, textAlign: 'center', fontSize: 10, color: '#64748b' } }, n);
      })
    )
  );
}`
  }
];

export default function App() {
  const [windows, setWindows] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('demo')) {
      return DEMO_WIDGETS.map((w, i) => ({
        id: w.widget_id,
        title: w.title,
        width: w.width,
        height: w.height,
        x: w.x,
        y: w.y + i * 4,
        source_code: w.source_code,
        zIndex: ++zIndexCounter,
      }));
    }
    return [];
  });
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
            console.warn('[App] CREATE_WIDGET sem source_code, ignorando:', message);
            return;
          }
          createWindowFromPayload(payload);
          break;
        }

        case 'UPDATE_WIDGET': {
          const { payload } = message;
          if (!payload?.widget_id) return;
          setWindows((prev) =>
            prev.map((w) =>
              w.id === payload.widget_id
                ? {
                    ...w,
                    title: payload.title ?? w.title,
                    width: payload.width ?? w.width,
                    height: payload.height ?? w.height,
                    source_code: payload.source_code ?? w.source_code,
                  }
                : w
            )
          );
          break;
        }

        case 'CLOSE_WIDGET': {
          const { payload } = message;
          if (!payload?.widget_id) return;
          setWindows((prev) => prev.filter((w) => w.id !== payload.widget_id));
          break;
        }

        case 'LIST_WIDGETS': {
          // Responde com snapshot dos widgets atuais
          send({
            action: 'WIDGET_EVENT',
            payload: {
              widget_id: '__system__',
              type: 'widget_list',
              data: windows.map((w) => ({
                id: w.id,
                title: w.title,
                width: w.width,
                height: w.height,
                x: w.x,
                y: w.y,
              })),
            },
          });
          break;
        }

        case 'QUERY_STATE': {
          const widgetId = message.payload?.widget_id;
          if (!widgetId) return;
          // Encaminha pro widget via appBus
          appBus.emit('ai:command:' + widgetId, {
            command: 'query_state',
            queryId: message.payload?.queryId,
          });
          // Widget pode responder com appBus.emit('ai:emit', { widget_id, type, data })
          break;
        }

        case 'WIDGET_COMMAND': {
          const { widget_id, command, args } = message.payload ?? {};
          if (!widget_id) return;
          appBus.emit('ai:command:' + widget_id, { command, args });
          break;
        }

        default:
          console.warn('[App] Action desconhecida:', message.action);
      }
    },
    [createWindowFromPayload, send, windows]
  );

  const { status: wsStatus, send } = useWebSocket(WS_URL, { onMessage: handleSocketMessage });

  // --- Ponte appBus → WebSocket (widget → IA) ----------------------------
  useEffect(() => {
    const unsub = appBus.on('ai:emit', (payload) => {
      send({ action: 'WIDGET_EVENT', payload });
    });
    return unsub;
  }, [send]);

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

  return (<>
      <Sidebar onCreateFromPayload={createWindowFromPayload} demoWidgets={DEMO_WIDGETS} />
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
        {windows.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-slate-600 text-xs font-mono bg-[#121826]/60 border border-slate-800 rounded-full px-3 py-1.5 backdrop-blur pointer-events-none">
            Arraste com o botão do meio para pan · Feche widgets com o ×
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
  </>);
}
