function Widget({ appBus }) {
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  if (submitted) {
    return (
      <div style={{ background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', height: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#064e3b', border: '1px solid #22c55e', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px', color: '#22c55e' }}>{'\u2713'}</div>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Submitted!</div>
        <div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginBottom: '16px', lineHeight: 1.6 }}>
          Name: {form.name}<br />
          Email: {form.email}<br />
          Message: {form.message}
        </div>
        <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); setErrors({}); }}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          Reset
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#0B1120', color: '#e2e8f0', fontFamily: 'monospace', height: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Blank Form</h2>
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Name</label>
          <input value={form.name} onChange={handleChange('name')}
            style={{ width: '100%', background: '#131c31', border: '1px solid ' + (errors.name ? '#ef4444' : '#1e2d4a'), color: '#e2e8f0', padding: '8px 10px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          {errors.name && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{errors.name}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Email</label>
          <input value={form.email} onChange={handleChange('email')}
            style={{ width: '100%', background: '#131c31', border: '1px solid ' + (errors.email ? '#ef4444' : '#1e2d4a'), color: '#e2e8f0', padding: '8px 10px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          {errors.email && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{errors.email}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Message</label>
          <textarea value={form.message} onChange={handleChange('message')}
            style={{ width: '100%', height: '100%', minHeight: '60px', background: '#131c31', border: '1px solid ' + (errors.message ? '#ef4444' : '#1e2d4a'), color: '#e2e8f0', padding: '8px 10px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }} />
          {errors.message && <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>{errors.message}</div>}
        </div>
        <button type="submit"
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
          Submit
        </button>
      </form>
    </div>
  );
}
