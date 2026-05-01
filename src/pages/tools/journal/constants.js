// ── HELPERS ───────────────────────────────────────────────────
export function today() {
    return new Date().toISOString().split('T')[0]
}

export const ASSETS = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURGBP', 'EURJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
    'GBPJPY', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
    'AUDJPY', 'AUDCAD', 'AUDCHF', 'AUDNZD',
    'CADJPY', 'CADCHF',
    'NZDJPY', 'NZDCAD', 'NZDCHF',
    'CHFJPY',
    'XAUUSD', 'XAGUSD', 'WTI', 'BRENT', 'NATGAS',
    'US30', 'SPX500', 'NAS100', 'US2000',
    'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD'
]

export const emptyForm = {
    pair: '', dir: 'long', date: '', session: '',
    entry: '', exit: '', sl: '', tp: '',
    lots: '0.10', pipval: '1.00', commissions: '', entryTime: '', exitTime: '', exit_date: '', emotion: '', notes: '', images: [],
}

export const MOTIVATIONAL_NOTES = [
    "Discipline is the bridge between goals and accomplishment. Great execution!",
    "The market is a device for transferring money from the impatient to the patient.",
    "Focus on the process, not the outcome. You're building an elite mindset.",
    "Every trade is a lesson. Whether win or loss, your discipline is your true edge.",
    "Success in trading is not about being right, but about being disciplined.",
    "Trust your edge. The statistics will take care of the rest.",
    "Professional traders trade for the process, amateurs trade for the money.",
    "A losing trade with good discipline is a better outcome than a winning trade with bad habits."
]
