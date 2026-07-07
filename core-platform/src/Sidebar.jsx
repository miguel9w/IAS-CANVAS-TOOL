import React, { useState, useRef, useCallback, useEffect } from 'react';

const BASE_URL = import.meta.env.BASE_URL || '/';

const SECTION = { DEMO: 'demo', CUSTOM: 'custom', LIBRARY: 'library', LOCAL: 'local' };

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
  database: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
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
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(null);
  const fileInputRef = useRef(null);

  const toggleSection = useCallback((section) => {
    setExpanded((prev) => (prev === section ? null : section));
  }, []);

  useEffect(() => {
    if (expanded !== SECTION.LOCAL || catalog) return;
    setCatalogLoading(true);
    fetch(`${BASE_URL}widgets-database/index.json`)
      .then((r) => r.json())
      .then((data) => setCatalog(data))
      .catch(() => setCatalog(null))
      .finally(() => setCatalogLoading(false));
  }, [expanded, catalog]);

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

  const handleLoadWidget = useCallback((widget, cat) => {
    const fileUrl = `${BASE_URL}widgets-database/${widget.file}`;
    fetch(fileUrl)
      .then((r) => r.text())
      .then((src) => {
        onCreateFromPayload({
          widget_id: widget.id + '-' + Date.now(),
          title: widget.title,
          width: 480,
          height: 400,
          source_code: src,
        });
        setIsOpen(false);
      })
      .catch(() => {});
  }, [onCreateFromPayload]);

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

          <SidebarItem
            icon={ICONS.database}
            label="Biblioteca Local"
            expanded={expanded === SECTION.LOCAL}
            onClick={() => toggleSection(SECTION.LOCAL)}
            chevron={ICONS.chevron}
            badge={catalog && !catalogLoading ? String(catalog.widgets.length) : null}
          >
            <div className="pt-2 space-y-2">
              {catalogLoading ? (
                <p className="text-xs text-slate-500 animate-pulse">Carregando catálogo...</p>
              ) : !catalog ? (
                <p className="text-xs text-slate-500">Catálogo indisponível.</p>
              ) : (
                <CategoriesList
                  widgets={catalog.widgets}
                  categoryOpen={categoryOpen}
                  onToggleCat={(cat) => setCategoryOpen((prev) => (prev === cat ? null : cat))}
                  onLoad={handleLoadWidget}
                  ICONS={ICONS}
                />
              )}
            </div>
          </SidebarItem>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, children, expanded, onClick, chevron, badge }) {
  return (
    <div>
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/[0.04] hover:text-slate-100 transition-colors"
      >
        <span className="shrink-0 text-slate-500">{icon}</span>
        <span>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold text-teal-400 bg-teal-400/10 rounded">{badge}</span>
        )}
        <span className={`ml-auto transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
          {chevron}
        </span>
      </button>
      {expanded && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function CategoriesList({ widgets, categoryOpen, onToggleCat, onLoad, ICONS }) {
  const cats = {};
  widgets.forEach((w) => {
    if (!cats[w.category]) cats[w.category] = [];
    cats[w.category].push(w);
  });
  return (
    <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
      {Object.keys(cats).sort().map((cat) => {
        const items = cats[cat];
        const isOpen = categoryOpen === cat;
        return (
          <div key={cat}>
            <button
              onClick={() => onToggleCat(cat)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] transition-colors"
            >
              <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                {ICONS.chevron}
              </span>
              <span className="capitalize">{cat.replace('-', ' ')}</span>
              <span className="ml-auto text-[10px] text-slate-600">{items.length}</span>
            </button>
            {isOpen && (
              <div className="ml-3 space-y-0.5 border-l border-slate-700/50 pl-2">
                {items.map((w) => (
                  <div key={w.id} className="flex items-center gap-2 py-1">
                    <span className="text-xs text-slate-500 truncate flex-1">{w.title}</span>
                    <button
                      onClick={() => onLoad(w, cat)}
                      className="shrink-0 px-2 py-0.5 text-[10px] font-medium text-teal-400 bg-teal-400/10 rounded hover:bg-teal-400/20 transition-colors"
                    >
                      {ICONS.package}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
