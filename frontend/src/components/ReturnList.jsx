import { useState, useEffect, useCallback } from 'react';
import { getMyReturns, getReturns, reviewReturn } from '../api/returnApi';

const STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export default function ReturnList({ mode }) {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isEmployee = mode === 'employee';

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const data = isEmployee ? await getReturns() : await getMyReturns();
      setReturns(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isEmployee]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleReview = async (id, approved, rejectionReason = '') => {
    try {
      await reviewReturn(id, { approved, rejectionReason });
      fetchReturns();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="return-list card">
        <h2>{isEmployee ? 'Return Requests' : 'My Returns'}</h2>
        <div className="loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="return-list card">
      <h2>{isEmployee ? 'Return Requests' : 'My Returns'}</h2>
      {error && <div className="error">{error}</div>}
      {returns.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">↩</div>
          {isEmployee ? (
            <>
              <p>No return requests yet.</p>
              <p className="empty-sub">Pending requests will appear here for review.</p>
            </>
          ) : (
            <>
              <p>No return requests yet.</p>
              <p className="empty-sub">Submit a return request using the form to get started.</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isEmployee && <th>Customer</th>}
                <th>Order</th>
                <th>Item</th>
                <th>Condition</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                {isEmployee && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <ReturnRow key={r.id} request={r} isEmployee={isEmployee} onReview={handleReview} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReturnRow({ request, isEmployee, onReview }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  return (
    <tr>
      {isEmployee && <td><span className="customer-name">{request.userName}</span></td>}
      <td><span className="order-id">{request.orderId}</span></td>
      <td><span className="item-name">{request.itemName}</span></td>
      <td>
        <span className={`condition-tag condition-${request.condition.toLowerCase()}`}>
          {request.condition.replace(/_/g, ' ')}
        </span>
      </td>
      <td><span className="purchase-date">{request.purchaseDate}</span></td>
      <td className="reason-cell">{request.reason}</td>
      <td>
        <StatusBadge status={request.status} />
        {!isEmployee && request.reviewedBy && (
          <div className="reviewed-by">by {request.reviewedBy}</div>
        )}
      </td>
      {isEmployee && (
        <td>
          {request.status === 'PENDING' ? (
            <div className="actions">
              <button className="btn-approve" onClick={() => onReview(request.id, true)}>
                Approve
              </button>
              {!showRejectInput ? (
                <button className="btn-reject" onClick={() => setShowRejectInput(true)}>
                  Reject
                </button>
              ) : (
                <div className="reject-form">
                  <input
                    type="text"
                    placeholder="Rejection reason…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="btn-reject"
                    onClick={() => {
                      if (rejectReason.trim()) {
                        onReview(request.id, false, rejectReason);
                        setShowRejectInput(false);
                        setRejectReason('');
                      }
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : request.status === 'REJECTED' ? (
            <span className="rejection-note">{request.rejectionReason}</span>
          ) : (
            <span className="approved-note">Approved</span>
          )}
        </td>
      )}
    </tr>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
