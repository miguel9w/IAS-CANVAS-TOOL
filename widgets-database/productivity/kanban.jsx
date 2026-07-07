function Widget({ appBus }) {
  const [columns, setColumns] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('kanban_columns') || 'null'); }
    catch {}
    return [
      { id: 1, title: 'To Do', cards: [] },
      { id: 2, title: 'In Progress', cards: [] },
      { id: 3, title: 'Done', cards: [] }
    ];
  });
  const [newCol, setNewCol] = React.useState('');
  const [cardInputs, setCardInputs] = React.useState({});
  const [draggingCard, setDraggingCard] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('kanban_columns', JSON.stringify(columns));
  }, [columns]);

  const addCol = () => {
    if (!newCol.trim()) return;
    setColumns([...columns, { id: Date.now(), title: newCol.trim(), cards: [] }]);
    setNewCol('');
  };

  const delCol = (id) => setColumns(columns.filter(c => c.id !== id));

  const addCard = (colId) => {
    const text = cardInputs[colId];
    if (!text || !text.trim()) return;
    setColumns(columns.map(c => c.id === colId ? { ...c, cards: [...c.cards, { id: Date.now(), text: text.trim() }] } : c));
    setCardInputs({ ...cardInputs, [colId]: '' });
  };

  const delCard = (colId, cardId) => {
    setColumns(columns.map(c => c.id === colId ? { ...c, cards: c.cards.filter(card => card.id !== cardId) } : c));
  };

  const moveCard = (fromColId, cardId, toColId) => {
    let moved = null;
    setColumns(columns.map(c => {
      if (c.id === fromColId) {
        const card = c.cards.find(card => card.id === cardId);
        if (card) moved = { ...card };
        return { ...c, cards: c.cards.filter(card => card.id !== cardId) };
      }
      if (c.id === toColId && moved) {
        return { ...c, cards: [...c.cards, moved] };
      }
      return c;
    }));
  };

  const handleDragStart = (colId, cardId) => setDraggingCard({ colId, cardId });
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (toColId) => {
    if (draggingCard && draggingCard.colId !== toColId) {
      moveCard(draggingCard.colId, draggingCard.cardId, toColId);
    }
    setDraggingCard(null);
  };

  const s = {
    wrap: { background: '#0B1120', color: '#e2e8f0', fontFamily: 'system-ui,sans-serif', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 12px', color: '#7c83ff' },
    addRow: { display: 'flex', gap: '6px', marginBottom: '12px' },
    inp: { background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '6px', padding: '6px 10px', color: '#e2e8f0', fontSize: '12px', outline: 'none', flex: 1 },
    btn: { background: '#7c83ff', border: 'none', borderRadius: '6px', color: '#fff', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' },
    board: { flex: 1, display: 'flex', gap: '12px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '4px' },
    col: { background: '#0f172a', borderRadius: '8px', padding: '10px', minWidth: '200px', maxWidth: '240px', display: 'flex', flexDirection: 'column', flexShrink: 0, maxHeight: '100%' },
    colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    colTitle: { fontSize: '14px', fontWeight: 600, color: '#7c83ff' },
    delColBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px', padding: '0 2px' },
    cardArea: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '40px' },
    card: { background: '#0B1120', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', cursor: 'grab', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' },
    cardText: { flex: 1, wordBreak: 'break-word' },
    delCardBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px', padding: 0, flexShrink: 0 },
    addCardRow: { display: 'flex', gap: '4px', marginTop: '8px' },
    cardInp: { background: '#0B1120', border: '1px solid rgba(148, 163, 184, 0.08)', borderRadius: '4px', padding: '4px 8px', color: '#e2e8f0', fontSize: '12px', outline: 'none', flex: 1 },
    addCardBtn: { background: '#3a3a5c', border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.h}>📋 Kanban Board</div>
      <div style={s.addRow}>
        <input style={s.inp} placeholder="New column name..." value={newCol} onChange={e => setNewCol(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCol()} />
        <button style={s.btn} onClick={addCol}>+ Column</button>
      </div>
      <div style={s.board}>
        {columns.map(col => (
          <div key={col.id} style={s.col} onDragOver={handleDragOver} onDrop={() => handleDrop(col.id)}>
            <div style={s.colHeader}>
              <span style={s.colTitle}>{col.title} ({col.cards.length})</span>
              {columns.length > 1 && <button style={s.delColBtn} onClick={() => delCol(col.id)}>✕</button>}
            </div>
            <div style={s.cardArea}>
              {col.cards.map(card => (
                <div key={card.id} style={s.card} draggable onDragStart={() => handleDragStart(col.id, card.id)}>
                  <span style={s.cardText}>{card.text}</span>
                  <button style={s.delCardBtn} onClick={() => delCard(col.id, card.id)}>✕</button>
                </div>
              ))}
              {col.cards.length === 0 && <div style={{textAlign:'center',color:'#444',fontSize:'11px',padding:'12px'}}>Drop cards here</div>}
            </div>
            <div style={s.addCardRow}>
              <input style={s.cardInp} placeholder="+ Add card" value={cardInputs[col.id] || ''} onChange={e => setCardInputs({...cardInputs,[col.id]:e.target.value})} onKeyDown={e => e.key === 'Enter' && addCard(col.id)} />
              <button style={s.addCardBtn} onClick={() => addCard(col.id)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
