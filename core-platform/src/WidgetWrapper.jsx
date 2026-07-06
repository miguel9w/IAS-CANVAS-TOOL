// WidgetWrapper.jsx
// -----------------------------------------------------------------------
// Este é o "sandbox" de renderização dinâmica do Canvas: recebe uma
// STRING de código-fonte JSX (gerada pela IA, entregue pelo Plugin
// OpenCode) e a transforma em um componente React real, em tempo de
// execução, sem nenhum passo de build prévio.
//
// Fluxo:
//   1. Babel Standalone (window.Babel) transpila o JSX -> JS puro.
//   2. `new Function(...)` executa esse JS em um escopo isolado, expondo
//      explicitamente apenas `React` e `appBus` — nenhuma outra variável
//      do módulo (WebSocket, estado do Canvas, outros widgets) vaza para lá.
//   3. Por convenção, o código deve declarar uma função `Widget`, que é
//      o ponto de entrada procurado após a transpilação.
//
// Nota de segurança: `new Function` isola ESCOPO, não é um sandbox de
// segurança real (o código ainda roda com os mesmos privilégios da página).
// Em um cenário com plugins/IAs não confiáveis, o próximo passo evolutivo
// seria mover essa execução para um <iframe sandbox> ou Web Worker.
// -----------------------------------------------------------------------

import React, { useEffect, useState } from 'react';

/**
 * Error Boundary dedicado a cada Widget.
 *
 * É necessário porque erros de RENDERIZAÇÃO (ex: `undefined.map()`) dentro
 * do componente dinâmico só podem ser capturados por um Error Boundary de
 * classe — um try/catch comum na compilação não pega esse tipo de erro,
 * que só ocorre depois, durante o ciclo de render do React.
 */
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[WidgetWrapper] Erro de renderização capturado:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPanel
          title="Erro ao renderizar o widget"
          message={String(this.state.error?.message || this.state.error)}
        />
      );
    }
    return this.props.children;
  }
}

/** Painel visual padronizado para exibir erros de compilação/renderização. */
function ErrorPanel({ title, message }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-4 bg-red-950/40 text-red-300 text-xs font-mono overflow-auto">
      <div>
        <p className="font-bold mb-1">⚠ {title}</p>
        <p className="opacity-80 whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}

/**
 * Transpila e compila a string de código-fonte JSX em um componente React.
 * Mantida fora do corpo do WidgetWrapper para ficar isolada e testável.
 *
 * IAs frequentemente escrevem `import { useState } from 'react'` por hábito,
 * mesmo quando instruídas a não usar imports externos. Sem tratamento, isso
 * quebra com "Cannot use import statement outside a module", porque
 * `new Function(...)` executa como script comum, não como módulo ES.
 *
 * Para tolerar isso: usamos o plugin `transform-modules-commonjs` do Babel
 * (converte import/export para require/module.exports) e injetamos um
 * `require` mínimo que só conhece 'react' (apontando pro React já injetado).
 * `sourceType: 'unambiguous'` garante que widgets SEM import/export não
 * ganhem esse tratamento à toa (evita quebrar o caso comum).
 *
 * @param {string} sourceCode - código JSX bruto vindo do Plugin OpenCode
 * @param {import('./eventBus').default} appBus - barramento de eventos
 * @returns {React.ComponentType}
 */
function compileWidget(sourceCode, appBus) {
  if (!window.Babel) {
    throw new Error('Babel Standalone não foi encontrado em window.Babel (verifique o index.html).');
  }

  // 1. JSX -> JavaScript puro, e import/export -> require/module.exports
  //
  // IMPORTANTE: `runtime: 'classic'` força o Babel a gerar chamadas
  // `React.createElement(...)` em vez do "automatic runtime" (padrão desde
  // Babel 7.9+), que insere sozinho `import { jsx as _jsx } from
  // "react/jsx-runtime"` no topo do código. Sem essa opção, TODO widget com
  // JSX (ou seja, todos) geraria esse import, e nosso `require` (que só
  // conhece 'react') rejeitaria com "Import não suportado: react/jsx-runtime".
  const { code: transpiled } = window.Babel.transform(sourceCode, {
    presets: [['react', { runtime: 'classic' }]],
    plugins: ['transform-modules-commonjs'],
    sourceType: 'unambiguous', // só mexe em import/export se o código realmente usar
    filename: 'widget.jsx', // ajuda o Babel a produzir mensagens de erro mais úteis
  });

  // 2. Executa o código transpilado em um escopo isolado.
  //    `React`, `appBus`, `require`, `module` e `exports` são injetados
  //    explicitamente; nada mais do módulo atual vaza para dentro do widget.
  // eslint-disable-next-line no-new-func
  const factory = new Function(
    'React',
    'appBus',
    'require',
    'module',
    'exports',
    `
      "use strict";
      ${transpiled}
      if (typeof Widget !== 'undefined') { return Widget; }
      if (typeof module !== 'undefined' && module.exports) {
        if (typeof module.exports.default === 'function') return module.exports.default;
        if (typeof module.exports === 'function') return module.exports;
      }
      throw new Error('O código deve declarar uma função/componente chamado "Widget" (ou usar export default).');
    `
  );

  const moduleObj = { exports: {} };

  // "require" minimalista: resolve 'react' (o próprio React injetado) e,
  // como camada extra de proteção, também 'react/jsx-runtime' /
  // 'react/jsx-dev-runtime' — caso apareçam por algum motivo (o
  // `runtime: 'classic'` acima já evita isso na prática, mas um widget
  // poderia teoricamente vir com esse import escrito à mão). Qualquer outra
  // biblioteca gera um erro claro, em vez do erro genérico do Babel/JS.
  function widgetRequire(name) {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime' || name === 'react/jsx-dev-runtime') {
      return {
        Fragment: React.Fragment,
        jsx: (type, props, key) => {
          const { children, ...rest } = props || {};
          if (key !== undefined) rest.key = key;
          return React.createElement(type, rest, children);
        },
        jsxs: (type, props, key) => {
          const { children, ...rest } = props || {};
          if (key !== undefined) rest.key = key;
          return React.createElement(type, rest, ...(Array.isArray(children) ? children : [children]));
        },
      };
    }
    throw new Error(
      `Import não suportado: "${name}". O widget só pode importar 'react' — ` +
        'não há outras bibliotecas disponíveis no Canvas.'
    );
  }

  return factory(React, appBus, widgetRequire, moduleObj, moduleObj.exports);
}

/**
 * @param {object} props
 * @param {string} props.sourceCode - código JSX do widget (string)
 * @param {import('./eventBus').default} props.appBus
 * @param {string} props.windowId - id da janela, usado apenas em logs
 */
export default function WidgetWrapper({ sourceCode, appBus, windowId }) {
  const [Component, setComponent] = useState(null);
  const [compileError, setCompileError] = useState(null);

  // Recompila sempre que o código-fonte mudar — permite "hot-swap" do
  // conteúdo de um widget sem precisar recriar a janela inteira.
  useEffect(() => {
    setCompileError(null);
    try {
      const CompiledComponent = compileWidget(sourceCode, appBus);
      setComponent(() => CompiledComponent);
    } catch (err) {
      console.error(`[WidgetWrapper:${windowId}] Falha ao compilar widget:`, err);
      setCompileError(err.message);
      setComponent(null);
    }
    // appBus é estável (singleton), por isso não entra nas dependências.
  }, [sourceCode, windowId]);

  if (compileError) {
    return <ErrorPanel title="Erro de sintaxe (Babel)" message={compileError} />;
  }

  if (!Component) {
    return (
      <div className="h-full w-full flex items-center justify-center text-neutral-500 text-xs font-mono">
        compilando widget...
      </div>
    );
  }

  return (
    <WidgetErrorBoundary>
      <Component appBus={appBus} windowId={windowId} />
    </WidgetErrorBoundary>
  );
}
