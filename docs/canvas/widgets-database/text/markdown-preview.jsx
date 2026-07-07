function Widget({ appBus }) {
  const [text, setText] = React.useState('# Hello\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2\n\n`code here`\n\n[link text](https://example.com)');

  function renderMarkdown(md) {
    let html = md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#0f172a;padding:2px 6px;border-radius:3px;font-size:12px">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#22d3ee">$1</a>')
      .replace(/^- (.+)$/gm, '<li style="color:#cbd5e1">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:20px">$&</ul>');
    html = html.replace(/\n\n/g, '</p><p style="margin:8px 0">');
    return '<p style="margin:8px 0">' + html + '</p>';
  }

  const containerStyle = {
    background: '#0B1120', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(34, 211, 238, 0.15)',
    boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
    fontFamily: 'monospace', color: '#e2e8f0', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column'
  };
  const rowStyle = { display: 'flex', gap: '8px', flex: 1, minHeight: 0 };
  const halfStyle = { flex: 1, display: 'flex', flexDirection: 'column' };
  const labelStyle = { fontSize: '11px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <div style={halfStyle}>
          <div style={labelStyle}>Markdown</div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            style={{
              flex: 1, background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(148, 163, 184, 0.08)',
              borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '13px',
              resize: 'none', outline: 'none'
            }} />
        </div>
        <div style={halfStyle}>
          <div style={labelStyle}>Preview</div>
          <div style={{
            flex: 1, background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)',
            borderRadius: '4px', padding: '8px', overflow: 'auto', fontSize: '13px',
            lineHeight: 1.5, wordBreak: 'break-word'
          }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
        </div>
      </div>
    </div>
  );
}
