import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function PendingApproval() {
  const auth = useAuthStore()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkMsg, setCheckMsg] = useState('')

  const firstName = auth.user?.user_metadata?.first_name || 'there'

  async function handleLogout() {
    setLoggingOut(true)
    await auth.signOut()
    navigate('/')
  }

  async function handleCheckApproval() {
    setChecking(true)
    setCheckMsg('')
    await auth.refreshApproval()
    setChecking(false)
    if (auth.approved) {
      navigate('/dashboard')
    } else {
      setCheckMsg('Not approved yet. Please complete payment and contact us.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Navbar */}
      <nav style={{
        height: '64px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '22px', fontWeight: 800,
          color: 'var(--accent-blue)', letterSpacing: '-0.5px',
        }}>
          MktSim
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '8px 18px', borderRadius: '10px',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#ef4444'
            e.currentTarget.style.color = '#ef4444'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          background: 'var(--bg-panel)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-md)',
          padding: '48px 40px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid var(--border)',
        }}>

          <div style={{ fontSize: '52px', marginBottom: '20px' }}>⏳</div>

          <h1 style={{
            fontSize: '26px', fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px', marginBottom: '12px',
          }}>
            Hi {firstName}, your account is pending
          </h1>

          <p style={{
            fontSize: '15px', color: 'var(--text-secondary)',
            lineHeight: 1.7, marginBottom: '32px',
          }}>
            To activate your MktSim access, complete your
            payment and your account will be approved shortly.
          </p>

          {/* Steps */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '24px',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: '12px', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '16px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              How to get access
            </div>

            {[
              'Send payment via UPI / QR code',
              'Send payment screenshot to our Instagram or WhatsApp',
              'Your account will be activated within a few hours',
              'Come back here and click "Check Approval" below',
            ].map((text, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start',
                gap: '12px', marginBottom: i < 3 ? '12px' : '0',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  color: '#fff', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '2px',
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
                }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1.5px solid rgba(59,130,246,0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '14px', fontWeight: 600,
              color: 'var(--text-secondary)',
            }}>
              MktSim Full Access
            </span>
            <span style={{
              fontSize: '22px', fontWeight: 800,
              color: 'var(--accent-blue)',
            }}>
              ₹999
            </span>
          </div>

          {/* Contact */}
          <div style={{
            fontSize: '13px', color: 'var(--text-dim)',
            lineHeight: 1.8, marginBottom: '28px',
          }}>
            After payment contact us at
            <br />
            <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
              your Instagram / WhatsApp here
            </strong>
            <br />
            with your screenshot and registered email
            <br />
            <strong style={{ color: 'var(--text-primary)' }}>
              {auth.user?.email}
            </strong>
          </div>

          {/* Check approval button */}
          <button
            onClick={handleCheckApproval}
            disabled={checking}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--accent-blue)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: checking ? 'not-allowed' : 'pointer',
              opacity: checking ? 0.7 : 1,
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
              marginBottom: '12px',
            }}
            onMouseEnter={e => {
              if (!checking) e.currentTarget.style.background = '#2563eb'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent-blue)'
            }}
          >
            {checking ? 'Checking...' : '🔄 Check Approval Status'}
          </button>

          {/* Check message */}
          {checkMsg && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#ef4444',
              fontWeight: 500,
            }}>
              {checkMsg}
            </div>
          )}

          {/* Hint */}
          <div style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'var(--text-dim)',
          }}>
            Already approved? Click the button above to refresh your status.
          </div>
        </div>
      </div>
    </div>
  )
}