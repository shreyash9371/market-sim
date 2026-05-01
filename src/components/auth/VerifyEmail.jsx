export default function VerifyEmail({ verifyEmail, switchTab }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '20px', textAlign: 'center', paddingTop: '20px',
    }}>
      <div style={{ fontSize: '52px' }}>📧</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
        Check your email
      </div>
      <div style={{
        fontSize: '14px', color: 'var(--text-secondary)',
        lineHeight: 1.7, maxWidth: '300px',
      }}>
        We sent a confirmation link to
        <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '4px' }}>
          {verifyEmail}
        </strong>
      </div>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '16px 20px', fontSize: '13px',
        color: 'var(--text-secondary)', lineHeight: 1.7, textAlign: 'left', width: '100%',
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>Next steps:</strong>
        <br />1. Open your email inbox
        <br />2. Click the confirmation link
        <br />3. Come back here and log in
      </div>
      <button
        onClick={() => switchTab('login')}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px',
          border: 'none', background: 'var(--accent-blue)', color: '#fff',
          fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-blue)'}
      >
        Go to Login
      </button>
    </div>
  )
}
