import React, { useState, useRef, useEffect, createElement } from 'react';

const SECTION = { DEMO: 'demo', CUSTOM: 'custom', LIBRARY: 'library', LOCAL: 'local' };

var ICONS = {
  code: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('polyline', { points: '16 18 22 12 16 6' }),
    createElement('polyline', { points: '8 6 2 12 8 18' })
  ),
  upload: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    createElement('polyline', { points: '17 8 12 3 7 8' }),
    createElement('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
  ),
  globe: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('circle', { cx: '12', cy: '12', r: '10' }),
    createElement('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
    createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
  ),
  database: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }),
    createElement('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
    createElement('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' })
  ),
  settings: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('circle', { cx: '12', cy: '12', r: '3' }),
    createElement('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' })
  ),
  chevron: createElement('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('polyline', { points: '9 18 15 12 9 6' })
  ),
  external: createElement('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
    createElement('polyline', { points: '15 3 21 3 21 9' }), createElement('line', { x1: '10', y1: '14', x2: '21', y2: '3' })
  ),
  package: createElement('svg', { viewBox: '0 0 24 24', width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('line', { x1: '16.5', y1: '9.4', x2: '7.5', y2: '4.21' }),
    createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
    createElement('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }), createElement('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' })
  ),
  snap: createElement('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
    createElement('rect', { x: '3', y: '3', width: '7', height: '7' }),
    createElement('rect', { x: '14', y: '3', width: '7', height: '7' }),
    createElement('rect', { x: '3', y: '14', width: '7', height: '7' }),
    createElement('rect', { x: '14', y: '14', width: '7', height: '7' })
  ),
};

export default function Sidebar({ onCreateFromPayload, demoWidgets, gridSize, setGridSize }) {
  const [expanded, setExpanded] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [customSource, setCustomSource] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTimeout(function() {
      setCatalogLoading(true);
      fetch('/widgets-database/index.json')
        .then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function(data) {
          setCatalog(data);
          setCatalogLoading(false);
        })
        .catch(function() {
          setCatalog(null);
          setCatalogLoading(false);
        });
    }, 500);
  }, []);

  function toggleSection(section) {
    setExpanded(function(prev) { return prev === section ? null : section; });
    setCustomSource('');
  }

  function handleLoadWidget(widgetEntry, cat) {
    var path = '/widgets-database/' + cat + '/' + widgetEntry.file;
    fetch(path)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function(code) {
        onCreateFromPayload({
          widget_id: widgetEntry.id,
          title: widgetEntry.title,
          width: widgetEntry.width || 400,
          height: widgetEntry.height || 300,
          source_code: code,
        });
      })
      .catch(function(err) {
        console.error('Erro ao carregar widget:', err);
      });
  }

  function handleLoadDemo(demoWidget) {
    onCreateFromPayload(demoWidget);
  }

  function handleLoadCustom() {
    if (!customSource.trim()) return;
    onCreateFromPayload({
      widget_id: 'custom-' + Date.now(),
      title: 'Widget Customizado',
      width: 420,
      height: 340,
      source_code: customSource,
    });
    setCustomSource('');
  }

  function handleOpenLibrary() {
    window.open('https://github.com/miguel9w/IAS-CANVAS-TOOL', '_blank');
  }

  function handleFileChange(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      setCustomSource(ev.target.result);
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  const gridSizes = [0, 10, 20, 40, 80];
  const gridLabels = { 0: 'Desligado', 10: '10px', 20: '20px', 40: '40px', 80: '80px' };

  return (
    <>
      <div className="fixed top-3 left-3 z-50 max-h-[calc(100vh-24px)] overflow-y-auto rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/50 backdrop-blur-xl" style={{ width: '280px', background: 'rgba(18,24,38,0.95)' }}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-7 h-7 rounded-lg bg-teal-400/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-200">Canvas Infinito</h1>
              <p className="text-[10px] text-slate-500">Plataforma de Widgets</p>
            </div>
          </div>

          <div className="space-y-1">
            <SidebarItem
              icon={ICONS.code}
              label="Widgets Demonstrativos"
              expanded={expanded === SECTION.DEMO}
              onClick={() => toggleSection(SECTION.DEMO)}
              chevron={ICONS.chevron}
            >
              <div className="pt-2 space-y-1.5">
                {demoWidgets.map(function(w) {
                  var [dHover, setDHover] = React.useState(false);
                  return createElement('button', {
                    key: w.widget_id,
                    onClick: function() { handleLoadDemo({ widget_id: w.widget_id, title: w.title, width: w.width, height: w.height, x: w.x, y: w.y, source_code: w.source_code }); },
                    className: 'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors',
                    style: { color: dHover ? '#e2e8f0' : '#94a3b8', background: dHover ? 'rgba(45,212,191,0.08)' : 'transparent' },
                    onMouseEnter: function() { setDHover(true); },
                    onMouseLeave: function() { setDHover(false); },
                  }, w.title);
                })}
              </div>
            </SidebarItem>

            <SidebarItem
              icon={ICONS.upload}
              label="Widget Customizado"
              expanded={expanded === SECTION.CUSTOM}
              onClick={() => toggleSection(SECTION.CUSTOM)}
              chevron={ICONS.chevron}
            >
              <div className="pt-2 space-y-2">
                <textarea
                  value={customSource}
                  onChange={function(e) { setCustomSource(e.target.value); }}
                  placeholder="Cole o código JSX do widget aqui..."
                  className="w-full h-24 px-3 py-2 text-xs font-mono rounded-lg border resize-none focus:outline-none focus:ring-1"
                  style={{ background: '#0B1120', color: '#e2e8f0', borderColor: '#334155' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleLoadCustom}
                    disabled={!customSource.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-30 border"
                    style={{ background: '#0d9488', color: '#fff', borderColor: '#14b8a6' }}
                  >
                    {ICONS.upload}
                    Carregar
                  </button>
                  <button
                    onClick={function() { fileInputRef.current?.click(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Abrir arquivo
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

            <SidebarItem
              icon={ICONS.snap}
              label="Configurações"
              expanded={expanded === SECTION.SETTINGS}
              onClick={() => toggleSection(SECTION.SETTINGS)}
              chevron={ICONS.chevron}
            >
              <div className="pt-2 space-y-2">
                <label className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Snap to Grid</span>
                  <select value={gridSize} onChange={function(e){setGridSize(Number(e.target.value));}}
                    className="text-xs border rounded px-2 py-1 bg-[#0B1120] text-slate-300 border-slate-700">
                    {gridSizes.map(function(s){return createElement('option',{key:s,value:s},gridLabels[s]);})}
                  </select>
                </label>
              </div>
            </SidebarItem>
          </div>
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
        style={{ color: hovered ? '#e2e8f0' : '#94a3b8', background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent' }}
        onMouseEnter={function(){setHovered(true);}}
        onMouseLeave={function(){setHovered(false);}}
      >
        <span className="shrink-0 text-slate-500">{icon}</span>
        <span>{label}</span>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded text-teal-400 bg-teal-400/10">{badge}</span>
        )}
        <span className="ml-auto transition-transform duration-200" style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
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
              style={{ color: catHovered ? '#e2e8f0' : '#94a3b8', background: catHovered ? 'rgba(255,255,255,0.03)' : 'transparent' }}
              onMouseEnter={function(){setCatHovered(true);}}
              onMouseLeave={function(){setCatHovered(false);}}
            >
              <span className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
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
