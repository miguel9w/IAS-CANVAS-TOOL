// FloatingWindow.jsx
// -----------------------------------------------------------------------
// Janela flutuante individual do Canvas Infinito. Responsável apenas pela
// "moldura" (arrastar, focar, fechar, redimensionar) — o CONTEÚDO é sempre
// delegado ao WidgetWrapper, que compila e renderiza o widget dinâmico.
// -----------------------------------------------------------------------

import React, { useCallback, useRef } from 'react';
import WidgetWrapper from './WidgetWrapper';

export default function FloatingWindow({ win, appBus, isActive, decorationsVisible = true, onFocus, onClose, onDrag, onResize }) {
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
      className="absolute flex flex-col rounded-lg overflow-hidden shadow-2xl border transition-shadow duration-150"
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex, background: 'var(--bg-surface)', borderColor: isActive ? 'color-mix(in srgb, var(--accent) 60%, transparent)' : 'color-mix(in srgb, var(--border) 80%, transparent)' }}
      onMouseDown={() => onFocus(win.id)}
    >
      {decorationsVisible && (<>
        {/* Barra de título — arrastável */}
        <div
          onMouseDown={handleTitleMouseDown}
          className="flex items-center justify-between px-3 py-2 cursor-move select-none border-b"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ color: 'color-mix(in srgb, var(--warning) 90%, transparent)', background: 'color-mix(in srgb, var(--warning) 10%, transparent)' }}>
              {String(win.id).slice(0, 8)}
            </span>
            <span className="text-xs font-mono truncate" style={{ color: 'var(--text-primary)' }}>{win.title}</span>
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
              className="text-sm leading-none px-1 shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={function(e){e.target.style.color='var(--accent-text)';}}
              onMouseLeave={function(e){e.target.style.color='var(--text-muted)';}}
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
              className="text-sm leading-none px-1 shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={function(e){e.target.style.color='var(--danger)';}}
              onMouseLeave={function(e){e.target.style.color='var(--text-muted)';}}
              aria-label="Fechar widget"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Alça de redimensionamento (canto inferior direito) */}
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          style={{ background: 'linear-gradient(135deg, transparent 50%, color-mix(in srgb, var(--accent) 50%, transparent) 50%)' }}
        />
      </>)}

      {/* Conteúdo dinâmico do widget */}
      <div className="flex-1 min-h-0" style={{ background: 'color-mix(in srgb, var(--bg-canvas) 70%, black)' }}>
        <WidgetWrapper sourceCode={win.source_code} appBus={appBus} windowId={win.id} />
      </div>
    </div>
  );
}
