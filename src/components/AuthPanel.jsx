import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function AuthPanel({ open, onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab)
  const [step, setStep] = useState(1) // 1=form, 2=verify email
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // Signup fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const auth = useAuthStore()
  const navigate = useNavigate()

  function reset() {
    setError('')
    setSuccess('')
    setStep(1)
    setShowForgot(false)
  }

  function switchTab(t) {
    setTab(t)
    reset()
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await auth.signIn({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      onClose()
      navigate('/dashboard')
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await auth.signUp({
      firstName,
      lastName,
      email: signupEmail,
      password: signupPassword,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setStep(2)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await auth.resetPassword(forgotEmail)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset email sent. Check your inbox.')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.3px',
  }

  const btnPrimary = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--accent-blue)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s',
    fontFamily: 'var(--font-sans)',
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0,
        height: '100vh',
        width: '400px',
        background: 'var(--bg-panel)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '28px 28px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '22px', fontWeight: 800,
            color: 'var(--accent-blue)', letterSpacing: '-0.5px',
          }}>
            MktSim
          </span>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '8px', width: '32px', height: '32px',
            cursor: 'pointer', fontSize: '18px',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0',
          margin: '24px 28px 0',
          background: 'var(--bg-card)',
          borderRadius: '10px',
          padding: '4px',
          flexShrink: 0,
        }}>
          {['login', 'signup'].map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: '9px',
                borderRadius: '8px', border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: tab === t ? 700 : 500,
                fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
              }}
            >
              {t === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '28px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '12px 14px',
              fontSize: '13px', color: '#ef4444',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '10px', padding: '12px 14px',
              fontSize: '13px', color: '#10b981',
              fontWeight: 500,
            }}>
              {success}
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === 'login' && !showForgot && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" required
                  placeholder="you@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" style={btnPrimary}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForgot(true); setError(''); setSuccess('') }}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--accent-blue)', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontWeight: 500, padding: '0',
                }}
              >
                Forgot password?
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {tab === 'login' && showForgot && (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter your email and we will send you a link to reset your password.
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
                onClick={() => { setShowForgot(false); setError(''); setSuccess('') }}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-secondary)', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                }}
              >
                ← Back to login
              </button>
            </form>
          )}

          {/* ── SIGNUP STEP 1 ── */}
          {tab === 'signup' && step === 1 && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text" required
                    placeholder="Shreyash"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text" required
                    placeholder="Sharma"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" required
                  placeholder="you@email.com"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" required
                  placeholder="min 6 characters"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password" required
                  placeholder="repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit" style={btnPrimary}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── SIGNUP STEP 2 — Email verification ── */}
          {tab === 'signup' && step === 2 && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '20px',
              textAlign: 'center', paddingTop: '20px',
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
                  {signupEmail}
                </strong>
              </div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                textAlign: 'left',
                width: '100%',
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Next steps:</strong>
                <br />1. Open your email inbox
                <br />2. Click the confirmation link
                <br />3. Come back here and log in
              </div>
              <button
                onClick={() => switchTab('login')}
                style={btnPrimary}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}