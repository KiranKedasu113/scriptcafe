export function CafeLogo({ size = 48, style = {} }) {
  return (
    <div
      className="cafe-logo-badge"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #2a2012 0%, #120d06 100%)',
        border: '1.5px solid var(--gold)',
        boxShadow: '0 0 12px rgba(216, 161, 58, 0.45), inset 0 0 8px rgba(216, 161, 58, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '2px',
        ...style,
      }}
    >
      <svg
        width={size * 0.36}
        height={size * 0.36}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginTop: '1px' }}
      >
        <path d="M6 13.8A4 4 0 0 1 7.92 7 4 4 0 0 1 16.08 7 4 4 0 0 1 18 13.8" />
        <path d="M6 17h12" />
        <path d="M7 14v3" />
        <path d="M17 14v3" />
      </svg>
      <span
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 900,
          fontSize: `${size * 0.17}px`,
          color: 'var(--gold)',
          lineHeight: 1,
          letterSpacing: '0.5px',
          marginTop: '1px',
          textShadow: '0 0 4px rgba(216, 161, 58, 0.6)',
        }}
      >
        ISHA
      </span>
      <span
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: `${size * 0.13}px`,
          color: 'var(--cream)',
          lineHeight: 1,
          letterSpacing: '1px',
          marginTop: '1px',
        }}
      >
        CAFE
      </span>
    </div>
  );
}
