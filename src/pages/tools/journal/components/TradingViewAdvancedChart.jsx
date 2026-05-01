const TV_SYMBOL_MAP = {
  'XAUUSD': 'TVC:GOLD', 'XAGUSD': 'TVC:SILVER', 'WTI': 'TVC:USOIL', 'BRENT': 'TVC:UKOIL',
  'NATGAS': 'TVC:NATURALGAS', 'US30': 'TVC:DJI', 'SPX500': 'OANDA:SPX500USD',
  'NAS100': 'OANDA:NAS100USD', 'US2000': 'TVC:RUT', 'BTCUSD': 'BITSTAMP:BTCUSD',
  'ETHUSD': 'BITSTAMP:ETHUSD', 'SOLUSD': 'COINBASE:SOLUSD', 'XRPUSD': 'BITSTAMP:XRPUSD',
  'ADAUSD': 'COINBASE:ADAUSD',
}

function getTVSymbol(pair) {
  if (TV_SYMBOL_MAP[pair]) return TV_SYMBOL_MAP[pair]
  if (pair && pair.length === 6) return `FX:${pair}`
  return pair || 'FX:EURUSD'
}

export function TradingViewAdvancedChart({ pair, theme }) {
  const symbol = getTVSymbol(pair || 'EURUSD')
  const tvTheme = theme === 'dark' ? 'dark' : 'light'
  const src = `https://www.tradingview.com/widgetembed/?` + new URLSearchParams({
    frameElementId: 'tradingview_chart',
    symbol,
    interval: 'H1',
    theme: tvTheme === 'dark' ? 'Dark' : 'Light',
    style: '1',
    locale: 'en',
    toolbar_bg: tvTheme === 'dark' ? '#1a1a2e' : '#f4f4f4',
    enable_publishing: '0',
    allow_symbol_change: '1',
    save_image: '1',
    hide_top_toolbar: '0',
    hide_side_toolbar: '0',
    withdateranges: '1',
    hideideas: '1',
    studies: '[]',
    show_popup_button: '0',
  }).toString()
  
  return (
    <iframe key={symbol + tvTheme} src={src} title="TradingView Advanced Chart"
      frameBorder="0" allow="fullscreen" loading="lazy"
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
    />
  )
}
