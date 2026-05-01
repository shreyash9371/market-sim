import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Btn } from '../../../../components/ui/BaseComponents';

export default function AICoachTab({
    chatMessages,
    chatInput,
    setChatInput,
    handleSendChat,
    isChatLoading,
    chatEndRef
}) {
    return (
        <div style={{
            position: 'fixed',
            top: '90px',
            left: '290px',
            right: '30px',
            bottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-panel)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            zIndex: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>AI Trading Assistant</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Ask questions about your setups, performance drops, or general market conditions.</p>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: msg.role === 'user' ? '75%' : '95%',
                            padding: '12px 16px', borderRadius: '12px',
                            fontSize: '14px', lineHeight: 1.6,
                            color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                            background: msg.role === 'user' ? 'var(--accent-blue)' : 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                        }}>
                            {msg.role === 'user' ? msg.content : (() => {
                                const barMatch = msg.content.match(/:::SESSION_BARS\n([\s\S]*?)\n:::/)
                                if (barMatch) {
                                    try {
                                        const parsed = JSON.parse(barMatch[1])
                                        return (
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{parsed.title}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{parsed.summary}</div>
                                                {parsed.bars.map(b => (
                                                    <div key={b.label} style={{ marginBottom: '14px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{b.label}</span>
                                                            <span style={{ fontSize: '13px', fontWeight: 700, color: b.wr >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{b.wr.toFixed(1)}% <span style={{ fontWeight: 400, color: 'var(--text-dim)', fontSize: '11px' }}>{b.wins}W / {b.losses}L</span></span>
                                                        </div>
                                                        <div style={{ height: '8px', background: 'var(--bg-base)', borderRadius: '999px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${b.wr}%`, background: b.wr >= 50 ? 'var(--accent-green)' : 'var(--accent-red)', borderRadius: '999px', transition: 'width .6s ease', opacity: 0.8 }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    } catch { return <span>{msg.content}</span> }
                                }
                                return (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: (props) => <div style={{ overflowX: 'auto', margin: '8px 0' }}><table style={{ borderCollapse: 'collapse', width: '100%' }} {...props} /></div>,
                                            thead: (props) => <thead style={{ background: 'var(--bg-base)' }} {...props} />,
                                            th: (props) => <th style={{ padding: '8px 14px', borderBottom: '2px solid var(--border)', fontWeight: 700, textAlign: 'left', color: 'var(--text-secondary)', fontSize: '11px' }} {...props} />,
                                            td: (props) => <td style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }} {...props} />,
                                            p: (props) => <p style={{ margin: '4px 0' }} {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )
                            })()}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            Thinking...
                        </div>
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            <div style={{ padding: '16px 24px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    {['Show me trades with > 3RR', 'Analyze my biggest loss', 'What is my best session?'].map(prompt => (
                        <button
                            key={prompt}
                            onClick={() => setChatInput(prompt)}
                            style={{
                                background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '999px',
                                padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ask the AI about your trading..."
                        style={{
                            flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
                            background: 'var(--bg-base)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none'
                        }}
                    />
                    <Btn primary onClick={() => handleSendChat()} disabled={isChatLoading || !chatInput.trim()}>
                        Send
                    </Btn>
                </div>
            </div>
        </div>
    );
}
