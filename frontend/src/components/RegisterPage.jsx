import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'Submit return requests for your orders' },
  { value: 'EMPLOYEE', label: 'Employee', desc: 'Approve or reject return requests' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selected = ROLES.find((r) => r.value === form.role);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">↩</Link>
          <h1>Create account</h1>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-toggle">
            <span className="label-text">I want to</span>
            <div className="role-options">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={`role-option${form.role === r.value ? ' active' : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                >
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <label>
            <span className="label-text">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Your name"
            />
          </label>

          <label>
            <span className="label-text">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            <span className="label-text">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            <span className="btn-content">
              {loading && <span className="spinner" />}
              {loading ? 'Creating account…' : `Create ${selected ? selected.label.toLowerCase() : ''} account`}
            </span>
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
