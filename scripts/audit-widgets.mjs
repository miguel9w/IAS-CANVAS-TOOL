import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';

const WIDGETS = join(import.meta.dirname, '..', 'widgets-database');

const results = [];

function check(file) {
  const src = readFileSync(file, 'utf-8');
  const rel = relative(WIDGETS, file);
  const issues = [];
  const lines = src.split('\n');

  // --- 1. JS Parse (acorn) ---
  try {
    const JSXParser = Parser.extend(jsx());
    JSXParser.parse(src, {
      ecmaVersion: 2022,
      sourceType: 'module',
      allowHashBang: true,
    });
  } catch (e) {
    issues.push({ severity: 'ERROR', rule: 'PARSE', msg: e.message });
  }

  // --- 2. Widget signature ---
  if (!/function\s+Widget\s*\(/.test(src))
    issues.push({ severity: 'ERROR', rule: 'SIGNATURE', msg: 'Missing function Widget(...)' });
  if (!/\{?\s*appBus\s*\}?\s*\)/.test(src))
    issues.push({ severity: 'WARN', rule: 'APPBUS', msg: 'Widget does not receive appBus' });

  // --- 3. Imports ---
  const importMatch = src.match(/^import\s+/m);
  if (importMatch) {
    const line = lines.findIndex(l => l.trim().startsWith('import '));
    if (line >= 0 && !src.includes('"react/jsx-runtime"'))
      issues.push({ severity: 'WARN', rule: 'IMPORT', msg: `Has import statement at line ${line+1}` });
  }

  // --- 4. Common bug: setState inside useEffect without deps causing loops ---
  const setStateCalls = [...src.matchAll(/\bset(\w+)\s*\(/g)];
  const useEffectBlocks = [...src.matchAll(/useEffect\s*\(\s*\(?\s*\)?\s*=>\s*\{/g)];
  const useEffectsWithDeps = src.match(/useEffect\s*\([^)]+\)\s*,\s*\[/g);

  for (const block of useEffectBlocks) {
    const start = block.index;
    const end = src.indexOf(')', start + block[0].length);
    const blockContent = src.slice(start, end > 0 ? end + 200 : start + 500);

    const setsInside = setStateCalls.filter(s => s.index > start && s.index < start + 500);
    const hasEmptyDeps = src.slice(end, end + 20).includes('[]');

    if (setsInside.length > 0 && hasEmptyDeps) {
      const names = setsInside.map(s => s[1]).join(', ');
      issues.push({
        severity: 'WARN', rule: 'LOOP_RISK',
        msg: `setState(${names}) inside useEffect with [] deps — may cause infinite re-render`
      });
    }
  }

  // --- 5. Missing useEffect cleanup for timers / listeners ---
  const hasSetInterval = src.includes('setInterval');
  const hasSetTimeout = src.includes('setTimeout');
  const hasRAFLoop = src.includes('requestAnimationFrame');
  const hasAddListener = src.includes('addEventListener');
  const hasCleanup = src.includes('return ') && (src.includes('clearInterval') || src.includes('clearTimeout') || src.includes('removeEventListener') || src.includes('cancelAnimationFrame'));

  const timerPatterns = [
    { name: 'setInterval', has: hasSetInterval, cleanup: 'clearInterval' },
    { name: 'setTimeout', has: hasSetTimeout, cleanup: 'clearTimeout' },
    { name: 'addEventListener', has: hasAddListener, cleanup: 'removeEventListener' },
    { name: 'requestAnimationFrame', has: hasRAFLoop, cleanup: 'cancelAnimationFrame' },
  ];

  for (const t of timerPatterns) {
    if (t.has && src.includes(t.cleanup)) continue;
    if (t.has && !t.has && !hasCleanup) continue;
    if (t.has && !src.includes(t.cleanup)) {
      // Check if maybe in a useEffect cleanup
      const inCleanup = src.match(/useEffect\s*\([^)]*return\s+\(?\s*\)?\s*=>\s*\{[\s\S]*?\}(?:,|\))/);
      if (!inCleanup || !inCleanup[0].includes(t.cleanup)) {
        issues.push({
          severity: 'WARN', rule: 'CLEANUP',
          msg: `${t.name} without ${t.cleanup} cleanup in useEffect return`
        });
      }
    }
  }

  // --- 6. Canvas ref pattern ---
  const usesCanvas = src.includes('<canvas') || src.includes('"canvas"');
  const hasGetContext = src.includes('getContext');
  const hasRef = src.includes('useRef');
  const hasCanvasCleanup = src.includes('cancelAnimationFrame') || src.includes('clearRect');

  if ((usesCanvas || hasGetContext) && !hasRef) {
    issues.push({
      severity: 'WARN', rule: 'CANVAS_REF',
      msg: 'Uses canvas/getContext but no useRef found (may not be getting canvas element correctly)'
    });
  }

  // --- 7. Missing key prop in lists ---
  const mapPattern = src.match(/\.map\s*\(/g);
  const keyPattern = src.match(/\bkey=/g);
  if (mapPattern && mapPattern.length > 3 && !keyPattern) {
    issues.push({
      severity: 'WARN', rule: 'MISSING_KEY',
      msg: `${mapPattern.length} .map() calls but no key= props — may cause React render warnings`
    });
  }

  // --- 8. Missing return in useEffect ---
  const effectBodies = [...src.matchAll(/useEffect\s*\(\s*(?:function\s*\([^)]*\)|\([^)]*\)\s*=>|\(?\s*\)?\s*=>)\s*\{([\s\S]*?)\}(?:\s*,\s*\[)/g)];
  for (const match of effectBodies) {
    const body = match[1];
    const hasSideEffect = body.includes('addEventListener') || body.includes('setInterval') || body.includes('setTimeout') || body.includes('requestAnimationFrame');
    // This is heuristic only
  }

  // --- 9. Check for potential NaN from undefined props ---
  if (src.includes('Math.') && !src.includes('|| 0') && !src.includes('?? 0')) {
    const mathExprs = [...src.matchAll(/Math\.\w+\(([^)]+)\)/g)];
    for (const m of mathExprs) {
      const args = m[1];
      if (/[a-z]/.test(args) && !args.includes('||') && !args.includes('??')) {
        issues.push({
          severity: 'HINT', rule: 'MATH_SAFETY',
          msg: `Math.${m[0].split('(')[0].split('.').pop()}(${args}) may receive undefined — consider default values`
        });
        break;
      }
    }
  }

  // --- 10. useCallback missing deps ---
  const callbacks = [...src.matchAll(/useCallback\s*\(\s*(?:\([^)]*\)|function)\s*=>\s*\{[\s\S]*?\}(?:\s*,\s*\[)/g)];
  for (const c of callbacks) {
    const afterParen = src.indexOf(')', c.index + c[0].length);
    const depStr = src.slice(c.index + c[0].length, afterParen + 1);
    if (depStr.includes('[]')) {
      const body = c[0];
      const refs = [...body.matchAll(/\b(set\w+|[a-z]\w*Ref|appBus|on\w+)\b/g)];
      const uniqueRefs = [...new Set(refs.map(r => r[1]))].filter(r => !['function','return','const','let','var','if','else','true','false','null','undefined','appBus'].includes(r));
      if (uniqueRefs.length > 0) {
        issues.push({
          severity: 'HINT', rule: 'CALLBACK_DEPS',
          msg: `useCallback with [] but body references: ${uniqueRefs.slice(0,3).join(', ')}`
        });
      }
    }
  }

  // --- 11. Inline function in JSX (performance) ---
  const inlineHandlers = src.match(/onClick\s*=\s*\{?\s*(?:\([^)]*\)\s*=>|function\s*\()/g);
  if (inlineHandlers && inlineHandlers.length > 2) {
    issues.push({
      severity: 'HINT', rule: 'INLINE_HANDLER',
      msg: `${inlineHandlers.length} inline handlers — consider extracting with useCallback`
    });
  }

  if (issues.length) results.push({ file: rel, lines: lines.length, size: src.length, issues });
}

function walk(dir) {
  const entries = readdirSync(dir);
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith('.jsx')) check(p);
  }
}

walk(WIDGETS);

// --- Print summary ---
const bySeverity = { ERROR: [], WARN: [], HINT: [] };
for (const r of results) {
  for (const i of r.issues) bySeverity[i.severity].push(i);
}

console.log(`\n=== AUDIT COMPLETE ===`);
console.log(`Total files: ${results.length + (results.reduce((a,r) => a + (r.issues.length === 0 ? 1 : 0), 0))}`);
console.log(`Files with issues: ${results.filter(r => r.issues.length > 0).length}`);
console.log(`  HINT:  ${bySeverity.HINT.length}`);
console.log(`  WARN:  ${bySeverity.WARN.length}`);
console.log(`  ERROR: ${bySeverity.ERROR.length}`);

console.log(`\n=== ERRORS ===`);
for (const r of results) {
  for (const i of r.issues) {
    if (i.severity === 'ERROR')
      console.log(`  ${r.file}: ${i.rule} — ${i.msg}`);
  }
}

console.log(`\n=== WARNINGS ===`);
for (const r of results) {
  for (const i of r.issues) {
    if (i.severity === 'WARN')
      console.log(`  ${r.file}: ${i.rule} — ${i.msg}`);
  }
}

console.log(`\n=== HINTS ===`);
for (const r of results) {
  for (const i of r.issues) {
    if (i.severity === 'HINT')
      console.log(`  ${r.file}: ${i.rule} — ${i.msg}`);
  }
}

// --- Summary per category ---
console.log(`\n=== BY CATEGORY ===`);
const catIssues = {};
for (const r of results) {
  const cat = r.file.split('/')[0];
  if (!catIssues[cat]) catIssues[cat] = { files: 0, issues: 0, errors: 0, warns: 0 };
  catIssues[cat].files++;
  catIssues[cat].issues += r.issues.length;
  catIssues[cat].errors += r.issues.filter(i => i.severity === 'ERROR').length;
  catIssues[cat].warns += r.issues.filter(i => i.severity === 'WARN').length;
}
for (const [cat, v] of Object.entries(catIssues).sort((a,b) => b[1].issues - a[1].issues)) {
  console.log(`  ${cat}/: ${v.files} files, ${v.issues} issues (${v.errors}E ${v.warns}W)`);
}
