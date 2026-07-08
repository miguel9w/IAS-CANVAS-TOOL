function Widget({ appBus }) {
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.length < 5) errs.message = 'At least 5 characters';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
      appBus.emit('form:submit', form);
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', textAlign: 'center', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#bb86fc' }}>
          FORM SUBMITTED
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '12px',
          textAlign: 'left', fontSize: '12px', marginBottom: '12px', border: '1px solid rgba(148, 163, 184, 0.08)',
        }}>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Name: <span style={{ color: '#e2e8f0' }}>{form.name}</span></div>
          <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Email: <span style={{ color: '#e2e8f0' }}>{form.email}</span></div>
          <div style={{ color: '#94a3b8' }}>Message: <span style={{ color: '#e2e8f0' }}>{form.message}</span></div>
        </div>
        <button onClick={reset} style={{
          padding: '8px 20px', background: '#bb86fc', border: 'none', borderRadius: '4px',
          color: '#121212', fontWeight: 'bold', cursor: 'pointer',
        }}>Reset</button>
      </div>
    );
  }

  const fields = [
    { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message here...' },
  ];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', color: '#e2e8f0', background: '#0B1120', border: '1px solid rgba(34, 211, 238, 0.15)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#bb86fc' }}>
        CONTACT FORM
      </div>
      <form onSubmit={handleSubmit}>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '3px' }}>
              {f.label}
            </label>
            {f.type === 'textarea' ? (
              <textarea value={form[f.key]} onChange={handleChange(f.key)}
                placeholder={f.placeholder} rows={3}
                style={{
                  width: '100%', padding: '7px 8px', background: '#0f172a', border: `1px solid ${errors[f.key] ? '#f44336' : 'rgba(148, 163, 184, 0.08)'}`,
                  borderRadius: '4px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'sans-serif',
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                }} />
            ) : (
              <input type={f.type} value={form[f.key]} onChange={handleChange(f.key)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '7px 8px', background: '#0f172a', border: `1px solid ${errors[f.key] ? '#f44336' : 'rgba(148, 163, 184, 0.08)'}`,
                  borderRadius: '4px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'sans-serif',
                  outline: 'none', boxSizing: 'border-box',
                }} />
            )}
            {errors[f.key] && (
              <div style={{ color: '#ef9a9a', fontSize: '10px', marginTop: '2px' }}>{errors[f.key]}</div>
            )}
          </div>
        ))}
        <button type="submit" style={{
          width: '100%', padding: '8px', background: '#bb86fc', border: 'none',
          borderRadius: '4px', color: '#121212', fontWeight: 'bold', fontSize: '13px',
          cursor: 'pointer',
        }}>Submit</button>
      </form>
    </div>
  );
}
