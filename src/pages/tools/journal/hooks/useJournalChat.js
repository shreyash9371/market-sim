import { useState, useRef, useEffect } from 'react'
import { calcPnl, calcRR, getTradeResult } from '../../../../utils/tradeMetrics'

export function useJournalChat(trades, firstName, activeTab) {
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI trading assistant. Ask me anything about your trade journal, patterns, or setups." }
  ])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (activeTab === 'AI Trading Coach') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isChatLoading, activeTab])

  async function handleSendChat(overrideInput) {
    const textToSubmit = (overrideInput || chatInput).trim()
    if (!textToSubmit) return
    const userMsg = { role: 'user', content: textToSubmit }
    setChatMessages(prev => [...prev, userMsg])
    if (!overrideInput) setChatInput('')
    setIsChatLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      if (!apiKey) {
        throw new Error('Please add a free VITE_GROQ_API_KEY to your .env file. Get one free at console.groq.com')
      }

      const consecutiveLosses = [...trades].reverse().slice(0, 3).filter(t => getTradeResult(t) === 'Loss').length
      const isStreak = consecutiveLosses >= 3

      const systemPrompt = `You are the Elite Trading Coach & Performance Psychologist for ${firstName}. You are an expert in CFDs, Futures, and passing Prop Firm challenges (FTMO, Topstep, Apex, E8, etc.).

COACHING PERSONALITY:
- You are supportive but rigorous. You prioritize discipline over profit.
- If the user is on a loss streak, you enter "FIRM LECTURE MODE". Be stern about risk management, cutting losses, and stopping for the day.
- You speak like a high-level mentor. Use terms like "mental capital", "equity curve preservation", "institutional order flow", and "A+ setups".

DOMAIN KNOWLEDGE:
- PROP FIRMS: Focus on major, genuine firms. Remind users of 5% daily drawdown limits, 10% max drawdown, and the importance of consistency for payouts.
- CFDs: Warn about spread expansion, overnight swap costs, and excessive leverage (>1:30).
- FUTURES: Use tick values ($10/tick for ES, $5/tick for NQ). Emphasize volume and centralized exchange transparency.

LECTURE STATUS: ${isStreak ? "ACTIVE. The user has lost 3+ trades in a row. You MUST start your response with a serious lecture about discipline and stopping for the day to protect their capital." : "NORMAL. Provide helpful analysis and answer questions."}

STRICT RULES:
- Address ${firstName} by name.
- Be concise. No fluff.
- For break-downs (SESSIONS, PAIRS, etc.): respond ONLY with a JSON block:
:::SESSION_BARS
{"title": "...", "summary": "...", "bars": [{"label": "New York", "wins": 1, "losses": 2, "total": 3, "wr": 33.3}]}
:::
- For specific trade lists: use a Markdown table (Date | Pair | Dir | P&L ($) | RR).
- Use 'pnl_usd' and 'rr' from the provided data. Do NOT recalculate.

Trade data (Recent 100 trades):
${JSON.stringify(trades.slice(-100).map(t => {
        const pnl = calcPnl(t)
        const rr = calcRR(t)
        return {
          date: t.date, pair: t.pair, dir: t.dir, session: t.session,
          entry: t.entry, exit: t.exit ?? 'open', sl: t.sl, tp: t.tp,
          lots: t.lots, pipval: t.pipval, commissions: t.commissions,
          pnl_usd: pnl ? pnl.usd : 'open',
          rr: parseFloat(rr.toFixed(2)),
          result: getTradeResult(t),
          notes: t.notes ? t.notes.substring(0, 100) : '',
          strategy: t.strategy,
        }
      }), null, 2)}`

      const geminiMessages = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
      geminiMessages.push({ role: 'user', content: userMsg.content })

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...geminiMessages
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API Error')
      }

      const aiText = data.choices[0].message.content
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiText }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }])
    } finally {
      setIsChatLoading(false)
    }
  }

  return {
    chatInput, setChatInput,
    chatMessages, setChatMessages,
    isChatLoading,
    handleSendChat,
    chatEndRef
  }
}
