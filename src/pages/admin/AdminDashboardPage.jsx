import { useEffect, useState } from 'react';
import { getOrderReport } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatCurrency';

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(24, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

const STATUS_COLORS = {
  NEW: 'var(--blue)',
  ACCEPTED: 'var(--gold)',
  PREPARING: 'var(--purple)',
  READY: 'var(--teal)',
  SERVED: 'var(--green)',
  COMPLETED: 'var(--green)',
  CANCELLED: 'var(--red)',
};

export function AdminDashboardPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState(todayRange().start.slice(0, 10));
  const [dateEnd, setDateEnd] = useState(todayRange().end.slice(0, 10));

  function loadReport(start, end) {
    setLoading(true);
    setError(null);
    getOrderReport(new Date(start).toISOString(), new Date(end + 'T23:59:59').toISOString())
      .then(setReport)
      .catch((err) => setError(err.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReport(dateStart, dateEnd);
  }, []);

  const maxCount = report
    ? Math.max(...Object.values(report.by_status || {}), 1)
    : 1;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Dashboard</h2>
          <p>Sales overview and order statistics</p>
        </div>
        <div className="admin-date-row" style={{ margin: 0 }}>
          <input
            type="date"
            className="staff-input"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            style={{ marginTop: 0, width: 'auto' }}
          />
          <span style={{ color: 'var(--cream-muted)', fontSize: 13 }}>to</span>
          <input
            type="date"
            className="staff-input"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            style={{ marginTop: 0, width: 'auto' }}
          />
          <button className="btn btn-gold" onClick={() => loadReport(dateStart, dateEnd)} disabled={loading}>
            {loading ? '…' : 'Apply'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card gold">
          <span className="admin-kpi-icon">💰</span>
          <span className="admin-kpi-label">Gross Revenue</span>
          <span className="admin-kpi-value">
            {report ? formatCurrency(report.gross_revenue) : '—'}
          </span>
        </div>
        <div className="admin-kpi-card blue">
          <span className="admin-kpi-icon">🧾</span>
          <span className="admin-kpi-label">Total Orders</span>
          <span className="admin-kpi-value">{report?.order_count ?? '—'}</span>
        </div>
        <div className="admin-kpi-card green">
          <span className="admin-kpi-icon">✅</span>
          <span className="admin-kpi-label">Completed</span>
          <span className="admin-kpi-value">{report?.completed_count ?? '—'}</span>
        </div>
        <div className="admin-kpi-card red">
          <span className="admin-kpi-icon">❌</span>
          <span className="admin-kpi-label">Cancelled</span>
          <span className="admin-kpi-value">{report?.cancelled_count ?? '—'}</span>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="admin-section">
        <h3>Orders by Status</h3>
        {loading && <div className="empty-state">Loading…</div>}
        {!loading && report && Object.entries(report.by_status || {}).length === 0 && (
          <div className="empty-state">No orders in this period.</div>
        )}
        {!loading && report && Object.entries(report.by_status || {}).map(([status, count]) => (
          <div key={status} className="admin-status-row">
            <span className={`status-badge ${status}`} style={{ width: 90, textAlign: 'center' }}>{status}</span>
            <div className="admin-status-bar-bg">
              <div
                className="admin-status-bar"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  background: STATUS_COLORS[status] || 'var(--gold)',
                }}
              />
            </div>
            <span className="admin-status-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
