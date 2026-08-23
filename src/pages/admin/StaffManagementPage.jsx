import { useEffect, useState } from 'react';
import { fetchStaffRoles, assignStaffRole, deactivateStaff } from '../../services/adminService';
import { STAFF_ROLE } from '../../utils/constants';

export function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: '', role: STAFF_ROLE.CASHIER, fullName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function reload() {
    fetchStaffRoles()
      .then(setStaff)
      .catch((err) => setError(err.message || 'Failed to load staff'));
  }

  useEffect(reload, []);

  async function handleAssign(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await assignStaffRole(form.email, form.role, form.fullName || null);
      setForm({ email: '', role: STAFF_ROLE.CASHIER, fullName: '' });
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message || 'Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(userId, name) {
    if (!confirm(`Revoke ${name || 'this account'}'s staff access?`)) return;
    try {
      await deactivateStaff(userId);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const activeStaff = staff.filter((s) => s.is_active);
  const inactiveStaff = staff.filter((s) => !s.is_active);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Staff Management</h2>
          <p>{activeStaff.length} active · {inactiveStaff.length} deactivated</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowForm((v) => !v)}>
          {showForm ? '✕ Cancel' : '＋ Assign Role'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="info-banner" style={{ marginBottom: 16 }}>
        💡 Create the staff login account first via the <strong>Supabase Dashboard → Authentication → Add user</strong>,
        then use this form to assign their role.
      </div>

      {/* Assign Role Form */}
      {showForm && (
        <div className="admin-form-card">
          <h3>Assign Staff Role</h3>
          <form onSubmit={handleAssign}>
            <div className="admin-form-row">
              <div className="admin-form-field" style={{ flex: '2 1 200px' }}>
                <label>Staff Email *</label>
                <input
                  className="staff-input"
                  type="email"
                  placeholder="staff@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ marginTop: 0 }}
                />
              </div>
              <div className="admin-form-field">
                <label>Full Name</label>
                <input
                  className="staff-input"
                  placeholder="Optional"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  style={{ marginTop: 0 }}
                />
              </div>
              <div className="admin-form-field">
                <label>Role *</label>
                <select
                  className="staff-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ marginTop: 0 }}
                >
                  {Object.values(STAFF_ROLE).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-gold" type="submit" disabled={submitting}>
                {submitting ? '⏳ Saving…' : '✓ Assign Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active staff */}
      <div className="admin-data-table">
        <div className="admin-data-table-head admin-staff-cols">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {activeStaff.map((s) => (
          <div key={s.user_id} className="admin-data-table-row admin-staff-cols">
            <span style={{ fontWeight: 700 }}>{s.full_name || <span style={{ color: 'var(--cream-muted)' }}>—</span>}</span>
            <span><span className={`role-badge ${s.role}`}>{s.role}</span></span>
            <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700 }}>● Active</span>
            <span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeactivate(s.user_id, s.full_name)}
              >
                Deactivate
              </button>
            </span>
          </div>
        ))}
        {activeStaff.length === 0 && (
          <div className="empty-state">No active staff. Assign a role above.</div>
        )}
      </div>

      {/* Deactivated staff */}
      {inactiveStaff.length > 0 && (
        <>
          <h3 style={{ marginTop: 24, marginBottom: 12, color: 'var(--cream-muted)', fontSize: 14 }}>
            Deactivated ({inactiveStaff.length})
          </h3>
          <div className="admin-data-table">
            {inactiveStaff.map((s) => (
              <div key={s.user_id} className="admin-data-table-row admin-staff-cols" style={{ opacity: .6 }}>
                <span>{s.full_name || '—'}</span>
                <span><span className={`role-badge ${s.role}`}>{s.role}</span></span>
                <span style={{ color: 'var(--red)', fontSize: 12, fontWeight: 700 }}>○ Inactive</span>
                <span />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
