import React, { useState, useRef, useCallback, useEffect } from 'react';
import themes from './themes';

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
  settings: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

export default function Sidebar({ onCreateFromPayload, demoWidgets, gridSize, setGridSize, theme, setTheme }) {
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
        className="fixed top-3 left-3 z-50 flex items-center justify-center w-9 h-9 rounded-lg backdrop-blur transition-all"
        aria-label="Abrir menu"
        style={{ color: 'var(--text-secondary)', background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)', border: '1px solid var(--border)' }}
        onMouseEnter={function(e){e.target.style.color='var(--text-primary)';e.target.style.background='color-mix(in srgb, var(--bg-elevated) 80%, transparent)';}}
        onMouseLeave={function(e){e.target.style.color='var(--text-secondary)';e.target.style.background='color-mix(in srgb, var(--bg-surface) 80%, transparent)';}}
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
        className={`fixed top-0 left-0 z-50 h-full w-80 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Canvas</span>
          <button
            onClick={() => setIsOpen(false)}
            className="transition-colors"
            aria-label="Fechar menu"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={function(e){e.target.style.color='var(--text-primary)';}}
            onMouseLeave={function(e){e.target.style.color='var(--text-muted)';}}
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
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Carrega os 6 widgets de demonstração no canvas.
              </p>
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{ color: 'var(--accent-text)', background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                onMouseEnter={function(e){e.target.style.background='color-mix(in srgb, var(--accent) 25%, transparent)';}}
                onMouseLeave={function(e){e.target.style.background='color-mix(in srgb, var(--accent) 15%, transparent)';}}
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
                className="w-full text-xs font-mono border rounded-lg p-3 resize-none focus:outline-none"
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
                onFocus={function(e){e.target.style.borderColor='var(--accent)';}}
                onBlur={function(e){e.target.style.borderColor='var(--border-light)';}}
                spellCheck={false}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleFileOpen}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)', background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)' }}
                  onMouseEnter={function(e){e.target.style.background='color-mix(in srgb, var(--bg-elevated) 70%, transparent)';}}
                  onMouseLeave={function(e){e.target.style.background='color-mix(in srgb, var(--bg-elevated) 50%, transparent)';}}
                >
                  {ICONS.folder}
                  Abrir arquivo
                </button>
                <button
                  onClick={handleCreateCustom}
                  disabled={!customCode.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  style={{ color: 'var(--accent-text)', background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                  onMouseEnter={function(e){if(!e.target.disabled)e.target.style.background='color-mix(in srgb, var(--accent) 25%, transparent)';}}
                  onMouseLeave={function(e){e.target.style.background='color-mix(in srgb, var(--accent) 15%, transparent)';}}
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
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Acesse o repositório no GitHub para explorar widgets públicos,
                exemplos e contribuir com a comunidade.
              </p>
              <button
                onClick={handleOpenLibrary}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors"
                style={{ color: 'var(--text-primary)', background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)' }}
                onMouseEnter={function(e){e.target.style.background='color-mix(in srgb, var(--bg-elevated) 70%, transparent)';}}
                onMouseLeave={function(e){e.target.style.background='color-mix(in srgb, var(--bg-elevated) 50%, transparent)';}}
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
                <p className="text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>Carregando catálogo...</p>
              ) : !catalog ? (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Catálogo indisponível.</p>
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

          <SidebarItem
            icon={ICONS.settings}
            label="Configurações"
            expanded={expanded === 'settings'}
            onClick={() => toggleSection('settings')}
            chevron={ICONS.chevron}
          >
            <div className="pt-2 space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <label className="flex items-center justify-between text-xs">
                <span>Snap to grid</span>
                <input type="checkbox" checked={gridSize > 0}
                  onChange={function(e){setGridSize(e.target.checked ? 20 : 0);}}
                  className="accent-[var(--accent)]" />
              </label>
              {gridSize > 0 && (
                <label className="flex items-center justify-between text-xs">
                  <span>Tamanho da grade</span>
                  <select value={gridSize} onChange={function(e){setGridSize(Number(e.target.value));}}
                    className="text-xs border rounded px-2 py-1"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}>
                    <option value={10}>10px</option>
                    <option value={20}>20px</option>
                    <option value={40}>40px</option>
                    <option value={80}>80px</option>
                  </select>
                </label>
              )}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <label className="flex items-center justify-between text-xs">
                  <span>Tema</span>
                  <select value={theme} onChange={function(e){setTheme(e.target.value);}}
                    className="text-xs border rounded px-2 py-1"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}>
                    {Object.keys(themes).map(function(k){return React.createElement('option',{key:k,value:k},themes[k].name);})}
                  </select>
                </label>
              </div>
            </div>
          </SidebarItem>
        </div>
      </div>
    </>
  );
}

function SidebarItem({ icon, label, children, expanded, onClick, chevron, badge }) {
  var [hovered, setHovered] = React.useState(false);
  return (
    <div>
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm transition-colors"
        style={{ color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)', background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent' }}
        onMouseEnter={function(){setHovered(true);}}
        onMouseLeave={function(){setHovered(false);}}
      >
        <span className="shrink-0" style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>{badge}</span>
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
        var [catHovered, setCatHovered] = React.useState(false);
        return (
          <div key={cat}>
            <button
              onClick={() => onToggleCat(cat)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors"
              style={{ color: catHovered ? 'var(--text-primary)' : 'var(--text-muted)', background: catHovered ? 'rgba(255,255,255,0.03)' : 'transparent' }}
              onMouseEnter={function(){setCatHovered(true);}}
              onMouseLeave={function(){setCatHovered(false);}}
            >
              <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                {ICONS.chevron}
              </span>
              <span className="capitalize">{cat.replace('-', ' ')}</span>
              <span className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>{items.length}</span>
            </button>
            {isOpen && (
              <div className="ml-3 space-y-0.5 pl-2" style={{ borderLeft: '1px solid color-mix(in srgb, var(--border) 50%, transparent)' }}>
                {items.map((w) => (
                  <div key={w.id} className="flex items-center gap-2 py-1">
                    <span className="text-xs truncate flex-1" style={{ color: 'var(--text-muted)' }}>{w.title}</span>
                    <button
                      onClick={() => onLoad(w, cat)}
                      className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded transition-colors"
                      style={{ color: 'var(--accent-text)', background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                      onMouseEnter={function(e){e.target.style.background='color-mix(in srgb, var(--accent) 25%, transparent)';}}
                      onMouseLeave={function(e){e.target.style.background='color-mix(in srgb, var(--accent) 15%, transparent)';}}
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
