import { useMemo } from 'react';
import { calcPnl, getTradeResult, SESSIONS, DAYS } from '../../../../utils/tradeMetrics';

export function useJournalStats(trades, dashboardFilter, dashboardSpecificDate, dashboardCustomStart, dashboardCustomEnd) {
    return useMemo(() => {
        // 1. Filter trades based on dashboard selection
        const dashboardFilteredTrades = trades.filter(t => {
            if (dashboardFilter === 'Today') return t.date === new Date().toISOString().split('T')[0];
            if (dashboardFilter === 'Yesterday') {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                return t.date === y.toISOString().split('T')[0];
            }
            if (dashboardFilter === 'Specific') return t.date === dashboardSpecificDate;
            if (dashboardFilter === 'Custom') {
                if (!dashboardCustomStart || !dashboardCustomEnd) return true;
                return t.date >= dashboardCustomStart && t.date <= dashboardCustomEnd;
            }
            return true;
        });

        // 2. Behavioral Bias Logic
        const longs = dashboardFilteredTrades.filter(t => t.dir === 'long').length;
        const shorts = dashboardFilteredTrades.filter(t => t.dir === 'short').length;
        const total = dashboardFilteredTrades.length;
        const bullPct = total ? longs / total : 0.5;
        const bearPct = total ? shorts / total : 0.5;

        let biasWord = 'NEUTRAL', biasColor = 'var(--text-secondary)', biasDesc = 'Balanced execution';
        if (bullPct > 0.6) { biasWord = 'BULLISH'; biasColor = 'var(--accent-green)'; biasDesc = 'Favoring buy setups'; }
        else if (bearPct > 0.6) { biasWord = 'BEARISH'; biasColor = 'var(--accent-red)'; biasDesc = 'Favoring sell setups'; }

        // 3. Day Performance Logic
        const dayStats = {};
        DAYS.forEach(d => dayStats[d] = { win: 0, loss: 0, net: 0 });
        dashboardFilteredTrades.forEach(t => {
            const pnl = calcPnl(t)?.usd || 0;
            const d = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
            if (dayStats[d]) {
                if (pnl >= 0) dayStats[d].win += pnl;
                else dayStats[d].loss += Math.abs(pnl);
                dayStats[d].net += pnl;
            }
        });
        const bestDay = DAYS.reduce((a, b) => dayStats[a].net > dayStats[b].net ? a : b);
        const maxBarVal = Math.max(...DAYS.map(d => Math.max(dayStats[d].win, dayStats[d].loss)), 100);

        // 4. Asset & Session Logic
        const assetMap = {}, sessionMap = {};
        SESSIONS.forEach(s => sessionMap[s.key] = { w: 0, l: 0 });
        dashboardFilteredTrades.forEach(t => {
            const pnl = calcPnl(t)?.usd || 0;
            const res = getTradeResult(t);
            if (!assetMap[t.pair]) assetMap[t.pair] = { w: 0, l: 0, pnl: 0 };
            if (res === 'Win') assetMap[t.pair].w++; else if (res === 'Loss') assetMap[t.pair].l++;
            assetMap[t.pair].pnl += pnl;

            if (t.session && sessionMap[t.session]) {
                if (res === 'Win') sessionMap[t.session].w++; else if (res === 'Loss') sessionMap[t.session].l++;
            }
        });
        const assetRows = Object.entries(assetMap).sort((a, b) => b[1].pnl - a[1].pnl).slice(0, 5);

        return {
            dashboardFilteredTrades,
            biasWord, biasColor, biasDesc, bullPct, bearPct, longs, shorts,
            bestDay, dayStats, maxBarVal, assetRows, sessionMap
        };
    }, [trades, dashboardFilter, dashboardSpecificDate, dashboardCustomStart, dashboardCustomEnd]);
}
