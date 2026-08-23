import { useAuth } from '../../context/AuthContext';

export function StaffNav({ children }) {
  const { logout } = useAuth();

  return (
    <nav className="staff-nav">
      <div className="staff-nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="https://www.ishacafe.store/logo.png"
          alt="ISHA CAFE"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1.5px solid var(--gold)',
            boxShadow: '0 0 10px rgba(216,161,58,0.4)',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{
            margin: 0,
            fontSize: '22px',
            fontFamily: 'Poppins',
            fontWeight: 'bold',
            color: 'var(--cream)',
            lineHeight: 1.1,
            letterSpacing: '0.5px'
          }}>
            ISHA <span style={{ color: 'var(--gold)' }}>CAFE</span>
          </h1>
          <span style={{
            fontSize: '9px',
            color: 'var(--cream-dim)',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            marginTop: '2px',
            fontWeight: 'bold'
          }}>
            GOOD FOOD, GOOD MOOD!
          </span>
        </div>
      </div>

      <div className="staff-nav-user" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {children}
        <button className="btn btn-outline btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
