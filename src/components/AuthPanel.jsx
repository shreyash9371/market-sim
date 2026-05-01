import { useState } from 'react'
import { useAuthStore } from '../store/auth/useAuthStore'
import { useNavigate } from 'react-router-dom'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/SignupForm'
import ForgotForm from './auth/ForgotForm'
import VerifyEmail from './auth/VerifyEmail'

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '10px',
  border: '1.5px solid var(--border)', fontSize: '14px',
  fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
  background: 'var(--bg-card)', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: '6px', display: 'block', letterSpacing: '0.3px',
}

const btnPrimary = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: 'none', background: 'var(--accent-blue)', color: '#fff',
  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
  transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
}

const btnGoogle = {
  width: '100%', padding: '14px', borderRadius: '12px',
  border: '1px solid var(--border)', background: 'var(--bg-panel)',
  color: 'var(--text-primary)', fontSize: '15px', fontWeight: 700,
  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
}

export default function AuthPanel({ open, onClose, defaultTab = 'login' }) {
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  
  const [forgotEmail, setForgotEmail] = useState('')
  const [verifyEmail, setVerifyEmail] = useState('')
  
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
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
    setShowForgot(false)
  }

  function switchTab(t) {
    setTab(t)
    reset()
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { data, error } = await auth.signIn({ email: loginEmail, password: loginPassword })
    setLoading(false)
    if (error) return setError(error.message)
    if (data?.user) {
      const approved = await auth.refreshApproval()
      onClose()
      navigate(approved ? '/dashboard' : '/pending')
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) return setError('Please enter your first and last name.')
    if (signupPassword !== confirmPassword) return setError('Passwords do not match.')
    if (signupPassword.length < 6) return setError('Password must be at least 6 characters.')
    
    setLoading(true)
    const { error } = await auth.signUp({ firstName, lastName, email: signupEmail, password: signupPassword })
    setLoading(false)
    if (error) return setError(error.message)
    
    setVerifyEmail(signupEmail)
    setTab('verify')
  }

  async function handleForgot(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await auth.resetPassword(forgotEmail)
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess('Password reset email sent. Check your inbox.')
  }

  async function handleGoogleLogin() {
    setError(''); setLoading(true)
    const { error } = await auth.signInWithGoogle()
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: '100%', maxWidth: '400px', background: 'var(--bg-panel)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', zIndex: 201,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '-0.5px' }}>MktSim</span>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {tab !== 'verify' && (
          <div style={{ display: 'flex', margin: '24px 28px 0', background: 'var(--bg-card)', borderRadius: '10px', padding: '4px', flexShrink: 0 }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: tab === t ? 700 : 500, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none', fontFamily: 'var(--font-sans)', textTransform: 'capitalize' }}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>{error}</div>}
          {success && tab !== 'verify' && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#10b981', fontWeight: 500 }}>{success}</div>}

          {tab === 'login' && !showForgot && (
            <LoginForm
              handleLogin={handleLogin} loginEmail={loginEmail} setLoginEmail={setLoginEmail}
              loginPassword={loginPassword} setLoginPassword={setLoginPassword} loading={loading}
              setShowForgot={setShowForgot} setError={setError} setSuccess={setSuccess}
              handleGoogleLogin={handleGoogleLogin} inputStyle={inputStyle} labelStyle={labelStyle}
              btnPrimary={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              btnGoogle={{ ...btnGoogle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            />
          )}

          {tab === 'login' && showForgot && (
            <ForgotForm
              handleForgot={handleForgot} forgotEmail={forgotEmail} setForgotEmail={setForgotEmail}
              loading={loading} setShowForgot={setShowForgot} setError={setError} setSuccess={setSuccess}
              inputStyle={inputStyle} labelStyle={labelStyle}
              btnPrimary={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            />
          )}

          {tab === 'signup' && (
            <SignupForm
              handleSignup={handleSignup} firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName} signupEmail={signupEmail} setSignupEmail={setSignupEmail}
              signupPassword={signupPassword} setSignupPassword={setSignupPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              loading={loading} handleGoogleLogin={handleGoogleLogin}
              inputStyle={inputStyle} labelStyle={labelStyle}
              btnPrimary={{ ...btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              btnGoogle={{ ...btnGoogle, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            />
          )}

          {tab === 'verify' && <VerifyEmail verifyEmail={verifyEmail} switchTab={switchTab} />}
        </div>
      </div>
    </>
  )
}
