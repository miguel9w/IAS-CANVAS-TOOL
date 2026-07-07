import React, { useState, useCallback, useEffect } from 'react';
import WidgetWrapper from './WidgetWrapper';

export default function PresentationMode({ windows, appBus, onExit, startIndex }) {
  var [slide, setSlide] = useState(startIndex || 0);
  var total = windows.length;

  var goNext = useCallback(function () { setSlide(function (s) { return Math.min(s + 1, total - 1); }); }, [total]);
  var goPrev = useCallback(function () { setSlide(function (s) { return Math.max(s - 1, 0); }); }, []);

  useEffect(function () {
    function handleKey(e) {
      if (e.key === 'Escape') { onExit(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { goNext(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { goPrev(); }
    }
    window.addEventListener('keydown', handleKey);
    return function () { window.removeEventListener('keydown', handleKey); };
  }, [onExit, goNext, goPrev]);

  useEffect(function () {
    if (document.fullscreenElement) return;
    document.documentElement.requestFullscreen().catch(function () {});
    return function () {
      if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
    };
  }, []);

  var win = windows[slide];
  if (!win) return null;

  var btn = {
    position: 'fixed', zIndex: 9999, fontFamily: 'monospace', fontSize: 11,
    border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8,
    cursor: 'pointer', transition: 'all 0.15s',
    padding: '7px 14px', fontWeight: 600,
    background: 'rgba(18,24,38,0.85)', color: '#e2e8f0',
    backdropFilter: 'blur(8px)',
  };

  return React.createElement('div', { style: { position: 'fixed', inset: 0, zIndex: 9998, background: '#0B1120', display: 'flex', flexDirection: 'column' } },
    React.createElement('div', { style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 20 } },
      React.createElement('div', { style: { width: '90%', height: '90%', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.08)', boxShadow: '0 0 60px rgba(0,0,0,0.5)' } },
        React.createElement(WidgetWrapper, { sourceCode: win.source_code, appBus: appBus, windowId: win.id })
      )
    ),
    React.createElement('div', { style: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 20px', background: 'linear-gradient(transparent, rgba(11,17,32,0.95))' } },
      React.createElement('button', { onClick: onExit, style: Object.assign({}, btn, { left: 20, bottom: 12, position: 'fixed', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }) },
        'Sair \u2716'
      ),
      React.createElement('button', { onClick: goPrev, disabled: slide === 0, style: Object.assign({}, btn, { opacity: slide === 0 ? 0.3 : 1 }) },
        '\u25C0 Anterior'
      ),
      React.createElement('span', { style: { color: '#64748b', fontFamily: 'monospace', fontSize: 12, minWidth: 60, textAlign: 'center' } },
        (slide + 1) + ' / ' + total
      ),
      React.createElement('button', { onClick: goNext, disabled: slide === total - 1, style: Object.assign({}, btn, { opacity: slide === total - 1 ? 0.3 : 1 }) },
        'Pr\u00f3ximo \u25B6'
      ),
    )
  );
}
