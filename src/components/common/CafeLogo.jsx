import logoImg from '../../assets/logo.png';

export function CafeLogo({ size = 48, style = {}, className = '' }) {
  return (
    <img
      src={logoImg}
      alt="ISHA CAFE"
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1.5px solid var(--gold)',
        boxShadow: '0 0 10px rgba(216, 161, 58, 0.4)',
        flexShrink: 0,
        ...style,
      }}
      onError={(e) => {
        e.target.src = '/logo.png';
      }}
    />
  );
}
