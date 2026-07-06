// FloatingWindow.jsx
// -----------------------------------------------------------------------
// Janela flutuante individual do Canvas Infinito. Responsável apenas pela
// "moldura" (arrastar, focar, fechar, redimensionar) — o CONTEÚDO é sempre
// delegado ao WidgetWrapper, que compila e renderiza o widget dinâmico.
// -----------------------------------------------------------------------

import React, { useCallback, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';

export default function FloatingWindow({ win, appBus, isActive, onFocus, onClose, onDrag, onResize }) {
  const dragState = useRef(null);
  const resizeState = useRef(null);

  // --- Arrastar pela barra de título --------------------------------------
  const handleTitleMouseDown = useCallback(
    (e) => {
      onFocus(win.id);
      dragState.current = { startX: e.clientX, startY: e.clientY, originX: win.x, originY: win.y };

      const handleMouseMove = (moveEvent) => {
        if (!dragState.current) return;
        const dx = moveEvent.clientX - dragState.current.startX;
        const dy = moveEvent.clientY - dragState.current.startY;
        onDrag(win.id, dragState.current.originX + dx, dragState.current.originY + dy);
      };

      const handleMouseUp = () => {
        dragState.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [win.id, win.x, win.y, onDrag, onFocus]
  );

  // --- Redimensionar pelo canto inferior direito --------------------------
  const handleResizeMouseDown = useCallback(
    (e) => {
      e.stopPropagation(); // evita disparar o drag da janela
      onFocus(win.id);
      resizeState.current = { startX: e.clientX, startY: e.clientY, originW: win.width, originH: win.height };

      const handleMouseMove = (moveEvent) => {
        if (!resizeState.current) return;
        const dw = moveEvent.clientX - resizeState.current.startX;
        const dh = moveEvent.clientY - resizeState.current.startY;
        onResize(
          win.id,
          Math.max(240, resizeState.current.originW + dw),
          Math.max(160, resizeState.current.originH + dh)
        );
      };

      const handleMouseUp = () => {
        resizeState.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [win.id, win.width, win.height, onResize, onFocus]
  );

  return (
    <div
      className={`absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border transition-shadow duration-150 ${
        isActive ? 'border-teal-400/60 shadow-teal-500/20' : 'border-slate-700/80 shadow-black/40'
      }`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex, background: '#121826' }}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* Barra de título — arrastável */}
      <div
        onMouseDown={handleTitleMouseDown}
        className="flex items-center justify-between px-3 py-2 bg-[#0E1420] cursor-move select-none border-b border-slate-800"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
            {String(win.id).slice(0, 8)}
          </span>
          <span className="text-xs font-mono text-slate-200 truncate">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const blob = new Blob([win.source_code], { type: 'text/jsx' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `widget-${win.id}.jsx`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-slate-500 hover:text-teal-400 text-sm leading-none px-1 shrink-0"
            title="Salvar widget"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8" />
              <path d="M7 3v5h8" />
            </svg>
          </button>
          <button
            onClick={() => onClose(win.id)}
            className="text-slate-500 hover:text-red-400 text-sm leading-none px-1 shrink-0"
            aria-label="Fechar widget"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Conteúdo dinâmico do widget */}
      <div className="flex-1 min-h-0 bg-[#0B0F19]">
        <WidgetWrapper sourceCode={win.source_code} appBus={appBus} windowId={win.id} />
      </div>

      {/* Alça de redimensionamento (canto inferior direito) */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(45,212,191,0.5) 50%)' }}
      />
    </div>
  );
}
