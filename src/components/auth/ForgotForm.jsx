export default function ForgotForm({
  handleForgot,
  forgotEmail, setForgotEmail,
  loading, setShowForgot, setError, setSuccess,
  inputStyle, labelStyle, btnPrimary
}) {
  return (
    <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Enter your email and we will send you a reset link.
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email" required
          placeholder="you@email.com"
          value={forgotEmail}
          onChange={e => setForgotEmail(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <button type="submit" style={btnPrimary}>
        {loading ? 'Sending...' : 'Send Reset Email'}
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForgot(false)
          setError('')
          setSuccess('')
        }}
        style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500,
        }}
      >
        ← Back to login
      </button>
    </form>
  )
}
