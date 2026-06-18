import { useState } from 'react';
import { submitReturn } from '../api/returnApi';

const CONDITIONS = ['LIKE_NEW', 'GOOD', 'FAIR', 'DAMAGED', 'DEFECTIVE'];
const CONDITION_LABELS = {
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
  DEFECTIVE: 'Defective',
};

export default function ReturnForm({ onSuccess }) {
  const [form, setForm] = useState({
    orderId: '',
    itemName: '',
    purchaseDate: '',
    condition: 'GOOD',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await submitReturn({
        ...form,
        purchaseDate: form.purchaseDate,
      });
      setForm({ orderId: '', itemName: '', purchaseDate: '', condition: 'GOOD', reason: '' });
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.reason.length;

  return (
    <form onSubmit={handleSubmit} className="return-form card">
      <h2>Submit Return Request</h2>

      {error && <div className="error">{error}</div>}

      <label>
        <span className="label-text">Order ID</span>
        <input
          name="orderId"
          value={form.orderId}
          onChange={handleChange}
          required
          placeholder="e.g. ORD-12345"
        />
      </label>

      <label>
        <span className="label-text">Item Name</span>
        <input
          name="itemName"
          value={form.itemName}
          onChange={handleChange}
          required
          placeholder="e.g. Wireless Mouse"
        />
      </label>

      <label>
        <span className="label-text">Purchase Date</span>
        <input
          name="purchaseDate"
          type="date"
          value={form.purchaseDate}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        <span className="label-text">Item Condition</span>
        <select name="condition" value={form.condition} onChange={handleChange}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
          ))}
        </select>
      </label>

      <label>
        <span className="label-text">Reason for Return</span>
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={500}
          placeholder="Describe why you are returning this item..."
          rows={4}
        />
        <div className={`char-count${charCount > 450 ? charCount > 490 ? ' danger' : ' warn' : ''}`}>
          {charCount} / 500
        </div>
      </label>

      <button type="submit" className="btn-submit" disabled={loading}>
        <span className="btn-content">
          {loading && <span className="spinner" />}
          {loading ? 'Submitting…' : 'Submit Return Request'}
        </span>
      </button>
    </form>
  );
}
