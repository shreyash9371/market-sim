export default function LandingStyles() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        50% { box-shadow: 0 0 40px rgba(59,130,246,0.4); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-fade-up {
        animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
      }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      .delay-3 { animation-delay: 0.3s; }
      
      .mobile-menu-btn {
        display: none;
        align-items: center;
        justify-content: center;
        background: var(--bg-panel);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 8px;
        color: var(--text-primary);
        cursor: pointer;
      }
      
      .bento-card {
        background: var(--bg-panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 32px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .bento-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
        border-color: rgba(59,130,246,0.3);
      }
      .glass-nav {
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(255,255,255,0.6);
      }
      [data-theme="dark"] .glass-nav {
        background: rgba(17, 24, 39, 0.65);
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .bg-grid {
        position: absolute; width: 100%; height: 100%; top: 0; left: 0;
        background-image: 
          linear-gradient(to right, rgba(59,130,246,0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59,130,246,0.07) 1px, transparent 1px);
        background-size: 50px 50px;
        mask-image: radial-gradient(ellipse at top, black 40%, transparent 70%);
        -webkit-mask-image: -webkit-radial-gradient(ellipse at top, black 40%, transparent 70%);
        z-index: 0; pointer-events: none;
      }
      ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
      * {
        scrollbar-width: none;
      }
      .animated-gradient-text {
        background: linear-gradient(270deg, #3b82f6, #6b21a8, #3b82f6);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 6s ease infinite;
      }
      .glow-button {
        position: relative;
      }
      .glow-button::before {
        content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
        background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981, #3b82f6);
        background-size: 400%; z-index: -1; border-radius: 18px;
        animation: gradientShift 8s linear infinite;
        opacity: 0; transition: opacity 0.3s ease;
      }
      .glow-button:hover::before { opacity: 1; }
      
      @media (max-width: 768px) {
        .glass-nav {
          padding: 16px !important;
          height: auto !important;
          flex-direction: column;
          gap: 0 !important;
        }
        .glass-nav > div:first-child {
          justify-content: space-between;
          width: 100%;
        }
        .mobile-menu-btn {
          display: flex !important;
        }
        .nav-links {
          display: none !important;
        }
        .nav-links.mobile-open {
          display: flex !important;
          flex-direction: column !important;
          width: 100%;
          margin-top: 16px;
          gap: 8px !important;
          padding-bottom: 8px;
        }
        .nav-links.mobile-open > * {
          width: 100% !important;
          justify-content: flex-start;
          text-align: left;
          padding: 12px 16px !important;
          font-size: 15px !important;
          margin: 0 !important;
        }
        .nav-links.mobile-open > *:last-child {
          margin-top: 8px !important;
          justify-content: center;
          text-align: center;
        }
        .hero-section {
          padding: 60px 16px 40px !important;
        }
        .hero-title {
          font-size: 36px !important;
          line-height: 1.1 !important;
          letter-spacing: -1px !important;
          margin-bottom: 20px !important;
        }
        .hero-subtitle {
          font-size: 15px !important;
          margin-bottom: 24px !important;
        }
        .hero-buttons {
          flex-direction: column !important;
          width: 100%;
          gap: 12px !important;
        }
        .hero-buttons > * {
          width: 100% !important;
        }
        .glow-button button {
          width: 100% !important;
          justify-content: center;
          padding: 14px 20px !important;
          font-size: 16px !important;
        }
        .hero-buttons > button {
          padding: 14px 20px !important;
          font-size: 16px !important;
        }
        .hero-update-badge {
          flex-direction: column;
          border-radius: 16px !important;
          padding: 8px 12px !important;
          text-align: center;
          font-size: 12px !important;
          margin-bottom: 24px !important;
        }
        .mockup-container {
          flex-direction: column !important;
          height: auto !important;
        }
        .mockup-left {
          border-right: none !important;
          border-bottom: 1px solid var(--border);
          padding: 24px !important;
        }
        .mockup-right {
          padding: 24px !important;
        }
        .bento-card-half {
          grid-column: span 12 !important;
        }
        .ai-spotlight-title {
          font-size: 24px !important;
        }
        .deep-dive-section {
          padding: 60px 16px !important;
        }
        .deep-dive-container {
          flex-direction: column !important;
          gap: 32px !important;
        }
        .deep-dive-container > div {
          width: 100% !important;
          flex: 1 1 100% !important;
        }
        .cta-section {
          padding: 80px 16px !important;
        }
        .cta-box {
          padding: 40px 20px !important;
        }
        .cta-title {
          font-size: 28px !important;
          line-height: 1.2 !important;
        }
        .cta-box p {
          font-size: 15px !important;
          margin-bottom: 24px !important;
        }
        .cta-box button {
          width: 100% !important;
          padding: 14px 20px !important;
          font-size: 16px !important;
        }
        .footer-links {
          flex-direction: column !important;
          gap: 16px !important;
        }
        .section-title {
          font-size: 32px !important;
          line-height: 1.1 !important;
          letter-spacing: -1px !important;
        }
        .section-subtitle {
          font-size: 16px !important;
          padding: 0 8px;
        }
        .stats-cards-container {
          flex-direction: column !important;
          gap: 12px !important;
        }
        .stats-cards-container > div {
           height: auto !important;
           padding: 16px !important;
        }
        .radar-box {
          height: 320px !important;
          width: 100% !important;
        }
        .step-container {
          padding: 24px 16px !important;
          border-left: none !important;
          border-bottom: 1px dashed var(--border);
        }
        .bento-card {
          padding: 24px !important;
        }
      }
    `}</style>
  )
}
