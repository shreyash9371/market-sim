export function getGuestTrades() {
  const baseEntry = 197.518;
  const baseSL = 196.924;
  const baseTP = 199.300;
  
  const trades = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 15);

  const results = ['Win', 'Loss', 'Win', 'Loss', 'Win', 'Loss', 'Win', 'Loss', 'Win', 'Loss'];

  // Risk = $100 => We want a $300 win and $100 loss.
  // The PnL calculation is: diff * lots * pipval.
  // diff for win = 199.300 - 197.518 = 1.782.
  // $300 = 1.782 * 1 * 168.3501.
  
  let currentDate = new Date();
  currentDate.setDate(1); // Start on the 1st of the current month
  let tradesPushed = 0;

  while (tradesPushed < 10) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const isWin = results[tradesPushed] === 'Win';
    
    trades.push({
      id: `guest-trade-${tradesPushed}`,
      user_id: 'guest',
      pair: 'GBPJPY',
      dir: 'long',
      date: currentDate.toISOString().split('T')[0],
      session: tradesPushed % 2 === 0 ? 'New York' : 'London',
      entry: baseEntry,
      exit: isWin ? baseTP : baseSL,
      sl: baseSL,
      tp: baseTP,
      lots: 1.0,
      pipval: 168.3501, // To make the exact Math $300 win and $100 loss
      commissions: 0,
      emotion: isWin ? 'Confident' : 'Frustrated',
      notes: isWin ? 'Perfect setup matching my 1H MA crossover. Followed the plan exactly.' : 'Stopped out. Setup was valid, just market noise.',
      images: ['https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80'], // Valid Chart Image Placeholder
      entryTime: '09:00',
      exitTime: isWin ? '14:30' : '10:15',
      exit_date: currentDate.toISOString().split('T')[0],
      created_at: new Date(currentDate).toISOString(),
    });

    tradesPushed++;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trades;
}
