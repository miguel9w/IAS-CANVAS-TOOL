function Widget({ appBus }) {
  const [cards, setCards] = React.useState([
    { id: 1, front: 'What is a closure?', back: 'A function that retains access to its outer scope even after the outer function has returned.' },
    { id: 2, front: 'What is the event loop?', back: 'A mechanism that handles async callbacks by checking the call stack and task queue.' },
    { id: 3, front: 'What does .map() return?', back: 'A new array with transformed elements.' },
    { id: 4, front: 'What is hoisting?', back: 'JavaScript behavior where variable/function declarations are moved to the top of their scope.' },
    { id: 5, front: '== vs === ?', back: '=== checks value and type; == coerces types before comparing.' },
  ]);
  const [current, setCurrent] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [shuffled, setShuffled] = React.useState([...Array(5).keys()]);

  const shuffle = () => {
    const arr = [...Array(cards.length).keys()];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
    setCurrent(0);
    setFlipped(false);
  };

  const next = () => {
    if (current < shuffled.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
    }
  };

  const cardIdx = shuffled[current];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc', letterSpacing: '1px' }}>
        FLASHCARDS — JS Basics
      </div>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
        Card {current + 1} of {shuffled.length}
      </div>
      <div onClick={() => setFlipped(!flipped)} style={{
        perspective: '800px', cursor: 'pointer', marginBottom: '12px', userSelect: 'none',
      }}>
        <div style={{
          transition: 'transform 0.4s', transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'none',
        }}>
          <div style={{
            background: '#0B1120', borderRadius: '8px', padding: '24px 16px',
            minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(148, 163, 184, 0.08)', backfaceVisibility: 'hidden',
            fontSize: '14px', textAlign: 'center', lineHeight: '1.5',
          }}>
            {flipped ? cards[cardIdx]?.back : cards[cardIdx]?.front}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#475569', textAlign: 'center', marginBottom: '12px' }}>
        click card to flip
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={prev} disabled={current === 0}
          style={{
            padding: '6px 14px', background: current === 0 ? '#1e293b' : '#bb86fc',
            border: 'none', borderRadius: '4px', color: current === 0 ? '#475569' : '#121212',
            fontWeight: 'bold', fontSize: '12px', cursor: current === 0 ? 'default' : 'pointer',
          }}>Prev</button>
        <button onClick={shuffle} style={{
          padding: '6px 14px', background: '#ff9800', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer',
        }}>Shuffle</button>
        <button onClick={next} disabled={current === shuffled.length - 1}
          style={{
            padding: '6px 14px', background: current === shuffled.length - 1 ? '#1e293b' : '#bb86fc',
            border: 'none', borderRadius: '4px', color: current === shuffled.length - 1 ? '#475569' : '#121212',
            fontWeight: 'bold', fontSize: '12px', cursor: current === shuffled.length - 1 ? 'default' : 'pointer',
          }}>Next</button>
      </div>
    </div>
  );
}
