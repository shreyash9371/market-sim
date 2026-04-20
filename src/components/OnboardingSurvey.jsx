import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../utils/supabase'

const QUESTIONS = [
  {
    id: 'q1',
    title: 'How long have you been trading?',
    options: ['0-1 year', '1-2 years', '2-3 years', '3+ years'],
  },
  {
    id: 'q2',
    title: "What's your biggest struggle with trade journaling right now?",
    options: [
      'Logging trades takes too long',
      "Don't know what to track",
      'Excel/sheets are painful',
      "I don't journal at all",
      'Other',
    ],
  },
  {
    id: 'q3',
    title: 'How often do you currently journal your trades?',
    options: ['Every trade', 'Sometimes', 'Rarely', 'Never'],
  },
]

export default function OnboardingSurvey() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [otherText, setOtherText] = useState('')

  useEffect(() => {
    const completed = localStorage.getItem('survey_completed')
    if (!completed) {
      setIsVisible(true)
      if (!localStorage.getItem('visitor_id')) {
        const randomId = 'guest-' + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('visitor_id', randomId)
      }
    }
  }, [])

  const completeSurvey = async (finalAnswers) => {
    setIsVisible(false)
    localStorage.setItem('survey_completed', 'true')

    const visitor_id = localStorage.getItem('visitor_id')

    const { data: { session } } = await supabase.auth.getSession()
    const user_id = session?.user?.id || null

    try {
      await supabase.from('surveys').insert([
        {
          visitor_id,
          user_id,
          q1: finalAnswers.q1,
          q2: finalAnswers.q2,
          q3: finalAnswers.q3,
        }
      ])
    } catch (err) {
      console.warn('Survey could not be saved to DB (table might not exist yet).', err)
    }
  }

  const handleNext = (val) => {
    let answerValue = val
    if (QUESTIONS[currentStep].id === 'q2' && val === 'Other') {
      if (!otherText.trim()) return
      answerValue = 'Other: ' + otherText
    }

    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: answerValue }
    setAnswers(newAnswers)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1)
      setOtherText('')
    } else {
      completeSurvey(newAnswers)
    }
  }

  const handleSkip = () => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: 'Skipped' }
    setAnswers(newAnswers)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1)
      setOtherText('')
    } else {
      completeSurvey(newAnswers)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1)
    }
  }

  if (!isVisible) return null

  const progressPct = ((currentStep + 1) / QUESTIONS.length) * 100
  const question = QUESTIONS[currentStep]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-panel)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          width: '100%',
          maxWidth: '560px',
          height: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '100px', background: 'var(--accent-blue)', opacity: 0.1,
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
        }} />

        {/* Header */}
        <div style={{
          padding: '24px 32px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          position: 'relative', zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleBack}
              style={{
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: '18px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '36px', height: '36px', borderRadius: '10px',
                opacity: currentStep > 0 ? 1 : 0.4,
                pointerEvents: currentStep > 0 ? 'auto' : 'none',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--text-dim)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              ←
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>
                Question {currentStep + 1} of {QUESTIONS.length}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500 }}>
                {QUESTIONS.length - currentStep - 1} {QUESTIONS.length - currentStep - 1 === 1 ? 'question' : 'questions'} remaining
              </span>
            </div>
          </div>

          <div style={{
            width: '120px', height: '6px', background: 'var(--bg-base)',
            borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              width: `${progressPct}%`, transition: 'width 0.4s ease',
              borderRadius: '3px'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <h2 style={{
                fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)',
                letterSpacing: '-0.5px', marginBottom: '32px', lineHeight: 1.3
              }}>
                {question.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.options.map(opt => {
                  const isOther = opt === 'Other'

                  if (isOther) {
                    return (
                      <div key={opt} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Other (please specify) ..."
                            value={otherText}
                            onChange={e => setOtherText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && otherText.trim() && handleNext('Other')}
                            style={{
                              flex: 1,
                              background: 'var(--bg-base)',
                              border: '1px solid var(--border)',
                              padding: '16px 20px',
                              borderRadius: '16px',
                              fontSize: '15px',
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontFamily: 'var(--font-sans)',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s'
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = 'var(--accent-blue)'
                              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = 'var(--border)'
                              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          />
                          <button
                            onClick={() => handleNext('Other')}
                            disabled={!otherText.trim()}
                            style={{
                              background: otherText.trim() ? 'linear-gradient(135deg, #3b82f6, #1e3a8a)' : 'var(--bg-base)',
                              border: `1px solid ${otherText.trim() ? 'transparent' : 'var(--border)'}`,
                              padding: '0 24px',
                              borderRadius: '16px',
                              cursor: otherText.trim() ? 'pointer' : 'not-allowed',
                              color: otherText.trim() ? '#fff' : 'var(--text-dim)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              minWidth: '64px',
                              transition: 'all 0.3s',
                              fontWeight: 700,
                              boxShadow: otherText.trim() ? '0 4px 12px rgba(59,130,246,0.2)' : 'none'
                            }}
                          >
                            →
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleNext(opt)}
                      style={{
                        background: 'var(--bg-base)', border: '1px solid var(--border)',
                        padding: '18px 24px', borderRadius: '16px',
                        fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)',
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'
                        e.currentTarget.style.background = 'var(--bg-panel)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--bg-base)'
                      }}
                    >
                      {opt}
                      <span style={{ color: 'var(--text-dim)', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <button
                  onClick={handleSkip}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    textDecoration: 'underline',
                    textDecorationColor: 'transparent',
                    textUnderlineOffset: '4px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.textDecorationColor = 'var(--text-secondary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.textDecorationColor = 'transparent'
                  }}
                >
                  Skip this question
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
