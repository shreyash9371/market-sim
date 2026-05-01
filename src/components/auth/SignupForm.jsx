export default function SignupForm({
  handleSignup,
  firstName, setFirstName,
  lastName, setLastName,
  signupEmail, setSignupEmail,
  signupPassword, setSignupPassword,
  confirmPassword, setConfirmPassword,
  loading, handleGoogleLogin,
  inputStyle, labelStyle, btnPrimary, btnGoogle
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              type="text" required placeholder="First name"
              value={firstName} onChange={e => setFirstName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              type="text" required placeholder="Last name"
              value={lastName} onChange={e => setLastName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email" required placeholder="you@email.com"
            value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password" required placeholder="min 6 characters"
            value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password" required placeholder="repeat password"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <button type="submit" style={btnPrimary}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>OR</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <button
        type="button" onClick={handleGoogleLogin} style={btnGoogle}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#9ca3af' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
