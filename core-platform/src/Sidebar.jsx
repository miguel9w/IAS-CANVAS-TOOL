import React, { useState, useRef, useCallback } from 'react';

const SECTION = { DEMO: 'demo', CUSTOM: 'custom', LIBRARY: 'library' };

const ICONS = {
  hamburger: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  ),
  demo: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><path d="M10 14L21 3" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

export default function Sidebar({ onCreateFromPayload, demoWidgets }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [customCode, setCustomCode] = useState('');
  const fileInputRef = useRef(null);

  const toggleSection = useCallback((section) => {
    setExpanded((prev) => (prev === section ? null : section));
  }, []);

  const handleCreateCustom = useCallback(() => {
    const trimmed = customCode.trim();
    if (!trimmed) return;
    onCreateFromPayload({
      widget_id: 'custom-' + Date.now(),
      title: 'Widget Personalizado',
      width: 420, height: 340,
      source_code: trimmed,
    });
  }, [customCode, onCreateFromPayload]);

  const handleFileOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomCode(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleLoadDemo = useCallback(() => {
    demoWidgets.forEach((w) => {
      onCreateFromPayload({
        widget_id: w.widget_id + '-' + Date.now(),
        title: w.title,
        width: w.width,
        height: w.height,
        source_code: w.source_code,
      });
    });
    setIsOpen(false);
  }, [demoWidgets, onCreateFromPayload]);

  const handleOpenLibrary = useCallback(() => {
    window.open('https://github.com/miguel9w/IAS-CANVAS-TOOL', '_blank', 'noopener');
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-3 z-50 flex items-center justify-center w-9 h-9 rounded-lg bg-[#121826]/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#1a2030] backdrop-blur transition-all"
        aria-label="Abrir menu"
      >
        {ICONS.hamburger}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-[#121826] border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <span className="text-sm font-semibold text-slate-200">Canvas</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Fechar menu"
          >
            {ICONS.close}
          </button>
        </div>

        <div className="p-4 space-y-2">
          <SidebarItem
            icon={ICONS.demo}
            label="Widgets Demo"
            expanded={expanded === SECTION.DEMO}
            onClick={() => toggleSection(SECTION.DEMO)}
            chevron={ICONS.chevron}
          >
            <div className="pt-2 space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Carrega os 6 widgets de demonstração no canvas.
              </p>
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-teal-400 bg-teal-400/10 rounded-lg hover:bg-teal-400/20 transition-colors"
              >
                {ICONS.play}
                Carregar Demo
              </button>
            </div>
          </SidebarItem>

          <SidebarItem
            icon={ICONS.code}
            label="Widget Personalizado"
            expanded={expanded === SECTION.CUSTOM}
            onClick={() => toggleSection(SECTION.CUSTOM)}
            chevron={ICONS.chevron}
          >
            <div className="pt-2 space-y-2">
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder={`function Widget({ appBus }) {\n  return <div>Olá, canvas!</div>;\n}`}
                rows={6}
                className="w-full bg-[#0B1120] text-slate-200 text-xs font-mono border border-slate-700 rounded-lg p-3 resize-none placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50"
                spellCheck={false}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleFileOpen}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  {ICONS.folder}
                  Abrir arquivo
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={!customCode.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-teal-400 bg-teal-400/10 rounded-lg hover:bg-teal-400/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {ICONS.play}
                  Criar Widget
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jsx,.js,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </SidebarItem>

          <SidebarItem
            icon={ICONS.globe}
            label="Biblioteca Pública"
            expanded={expanded === SECTION.LIBRARY}
            onClick={() => toggleSection(SECTION.LIBRARY)}
            chevron={ICONS.chevron}
          >
            <div className="pt-2 space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Acesse o repositório no GitHub para explorar widgets públicos,
                exemplos e contribuir com a comunidade.
              </p>
              <button
                onClick={handleOpenLibrary}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                {ICONS.external}
                Abrir repositório
              </button>
            </div>
          </SidebarItem>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, children, expanded, onClick, chevron }) {
  return (
    <div>
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/[0.04] hover:text-slate-100 transition-colors"
      >
        <span className="shrink-0 text-slate-500">{icon}</span>
        <span>{label}</span>
        <span className={`ml-auto transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
          {chevron}
        </span>
      </button>
      {expanded && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
