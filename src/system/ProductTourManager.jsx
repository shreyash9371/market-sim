import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useProductTour() {
  const location = useLocation();

  useEffect(() => {
    // A small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      runTourForPath(location.pathname);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}

const tourConfig = {
  showProgress: true,
  animate: true,
  smoothScroll: true,
  allowClose: true,
  doneBtnText: 'Got it',
  nextBtnText: 'Next &rarr;',
  prevBtnText: '&larr; Prev',
};

export function startTourManually(pathname) {
  runTourForPath(pathname, true);
}

export function startLogTradeTour(force = false) {
  if (localStorage.getItem('tour_log_trade_v1') && !force) return;
  setTimeout(() => {
    if (!document.querySelector('#tour-log-pair')) return;

    const d = driver({
      ...tourConfig,
      steps: [
        { element: '#tour-log-pair', popover: { title: 'Asset Pair', description: 'Enter the exact ticker you are trading (e.g., XAUUSD, NAS100).', side: "bottom" } },
        { element: '#tour-log-dir', popover: { title: 'Direction & Date', description: 'Long or Short, plus the exact time of execution.', side: "bottom" } },
        { element: '#tour-log-entry', popover: { title: 'Entry Price', description: 'Where did you get filled? Entering this accurately ensures your analytics are sound.', side: "bottom" } },
        { element: '#tour-log-sl', popover: { title: 'Stop Loss', description: 'Required. We use this to calculate your precise Risk-to-Reward (R) on the trade.', side: "bottom" } },
        { element: '#tour-log-tp', popover: { title: 'Take Profit', description: 'Your intended target. We track if price reached here before stopping you out.', side: "bottom" } },
        { element: '#tour-log-submit', popover: { title: 'Save Execution', description: 'Once saved, all metrics, R-multiples, and win-rates are automatically injected into your dashboard.', side: "top" } }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('tour_log_trade_v1', 'true');
        d.destroy();
      }
    });
    d.drive();
  }, 400); // Wait for modal to render
}

export function startSimulatorTour(isRealMarket, force = false) {
  const tourId = `tour_simulator_${isRealMarket ? 'real' : 'manual'}_v1`;
  if (localStorage.getItem(tourId) && !force) return;

  setTimeout(() => {
    if (isRealMarket) {
      if (!document.querySelector('#tour-start-price')) return;
      const d = driver({
        ...tourConfig,
        steps: [
          {
            element: '#tour-trade-btn',
            popover: { title: 'Live Tape Mode', description: 'You are now in Live Market mode. The engine will run continuously based on real microstructure logic.', side: "bottom", align: 'end' }
          },
          {
            element: '#tour-start-price',
            popover: { title: 'Initial Context', description: 'Set thousands of price ticks in motion by feeding the simulator a starting price level.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-speed-controls',
            popover: { title: 'Microstructure Speed', description: 'This isn\'t a video. This speeds up the order-matching engine. Watch liquidity shift dynamically.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-play-pause',
            popover: { title: 'Pause to Analyze', description: 'Stop real-time action right before a sweep or breakout to assess the structural formation.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-conditions',
            popover: { title: 'Market Conditions', description: 'Force the engine to execute specific algorithmic conditions like a "Liquidity Sweep" or "Stop Hunt" and watch how it alters the tape.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-dom-panel',
            popover: { title: 'Level II Data (DOM)', description: 'Real liquidity resting in the book. See where massive institutional blocks are stacked, absorbing retail flow.', side: "left", align: 'start' }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem(tourId, 'true');
          d.destroy();
        }
      });
      d.drive();
    } else {
      if (!document.querySelector('#tour-manual-orders')) return;
      const d = driver({
        ...tourConfig,
        steps: [
          {
            element: '#tour-trade-btn',
            popover: { title: 'Structure Builder', description: 'Welcome to the Simulator! By default, you are in Structure Builder mode where you manually control every single tick of the tape.', side: "bottom", align: 'end' }
          },
          {
            element: '#tour-manual-orders',
            popover: { title: 'Build Orders', description: 'Open this panel to build custom Limit and Market orders against the book.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-manual-generate',
            popover: { title: 'Generate Liquidity', description: 'Click here to automatically generate a random structural context to start from.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-manual-run',
            popover: { title: 'Execute Frame', description: 'Once you select a pending order, hit Run to execute it and step the market forward.', side: "bottom", align: 'center' }
          },
          {
            element: '#tour-dom-panel',
            popover: { title: 'Level II Data (DOM)', description: 'Real liquidity resting in the book. You can manually tweak limit orders here or auto-generate a randomized book.', side: "left", align: 'start' }
          },
          {
            element: '#tour-trade-btn',
            popover: { title: 'Ready for Live?', description: 'Once you master manual mechanics, toggle Real Market to unlock the live continuous simulation engine.', side: "bottom", align: 'end' }
          }
        ],
        onDestroyStarted: () => {
          localStorage.setItem(tourId, 'true');
          d.destroy();
        }
      });
      d.drive();
    }
  }, 400);
}

function runTourForPath(path, force = false) {

  if (path === '/dashboard') {
    if (localStorage.getItem('tour_dashboard_v1') && !force) return;

    // Only run if the element actually exists
    if (!document.querySelector('#tour-simulator-card')) return;

    const d = driver({
      ...tourConfig,
      steps: [
        {
          element: '#tour-navbar-user',
          popover: { title: 'Welcome to MktSim', description: 'This is your central hub for mastering market mechanics. Let’s take a quick look around.', side: "bottom", align: 'start' }
        },
        {
          element: '#tour-simulator-card',
          popover: { title: '1. The live simulator', description: 'This is where you train. Click this card to open the Basic Simulator where you can practice reading real order-flow.', side: "right", align: 'start' }
        },
        {
          element: '#tour-journal-card',
          popover: { title: '2. Track everything', description: 'After you take trades (simulated or live), log them here. The journal calculates your true edge automatically.', side: "right", align: 'start' }
        }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('tour_dashboard_v1', 'true');
        d.destroy();
      }
    });
    d.drive();
  }


  if (path === '/tools/journal') {
    if (localStorage.getItem('tour_journal_v1') && !force) return;

    if (!document.querySelector('#tour-new-trade')) return;

    const d = driver({
      ...tourConfig,
      steps: [
        {
          element: '#tour-journal-dashboard',
          popover: { title: 'Command Center', description: 'Overview of your total P&L, Win Rate, and basic stats across all logged trades.', side: "right", align: 'start' }
        },
        {
          element: '#tour-statistics-tab',
          popover: { title: 'True Edge Reveal', description: 'Dive deep into Radar charts, asset breakdown, and behavioral expectancy.', side: "right", align: 'start' }
        },
        {
          element: '#tour-journal-history',
          popover: { title: 'Trade History', description: 'A detailed spreadsheet of every execution. Edit, delete, or review your past setups.', side: "right", align: 'start' }
        },
        {
          element: '#tour-journal-ai',
          popover: { title: 'AI Trading Coach', description: 'Talk to an AI that already knows your exact P&L, pairs, and execution flaws.', side: "right", align: 'start' }
        },
        {
          element: '#tour-journal-images',
          popover: { title: 'Trade Gallery', description: 'Review the technical charts of all your logged setups to visually match your executions with market structure.', side: "right", align: 'start' }
        },
        {
          element: '#tour-new-trade',
          popover: { title: 'Log Trade', description: 'Let’s click here to open the logger, where you input your exact entries and exits.', side: "bottom", align: 'end' }
        }
      ],
      onDestroyStarted: () => {
        localStorage.setItem('tour_journal_v1', 'true');
        d.destroy();
      }
    });
    d.drive();
  }
}
