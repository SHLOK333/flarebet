import { EventType, OptionType, TradeType } from '../types';

// Mock events data - Sports Themed
export const events: EventType[] = [
  {
    id: 'football-championship-2025',
    name: 'European Football Championship 2025',
    description: 'The final outcome of the highly anticipated European Football Championship.',
    date: '2025-07-20T18:00:00Z', // Adjusted date for future event
    timelines: ['teamAWins', 'teamBWins'], // Changed to specific team outcomes
    resolved: false
  },
  {
    id: 'basketball-finals-2025',
    name: 'NBA Finals 2025 Series Winner',
    description: 'Predict the winner of the 2025 NBA Finals series.',
    date: '2025-06-25T02:00:00Z', // Adjusted date
    timelines: ['celticsWin', 'lakersWin'], // Changed to specific team outcomes
    resolved: false
  },
  {
    id: 'tennis-slam-australian-open',
    name: 'Australian Open 2026 Men\'s Singles',
    description: 'The champion of the men\'s singles tournament at the 2026 Australian Open.',
    date: '2026-01-28T10:00:00Z', // Adjusted date for future event
    timelines: ['djokovicWins', 'alcarazWins'], // Changed to specific player outcomes
    resolved: false
  }
];

// Mock options data - Sports Themed
export const options: OptionType[] = [
  // European Football Championship - Team A Wins/Team B Wins
  {
    id: 'football-option-1',
    eventId: 'football-championship-2025',
    timeline: 'teamAWins',
    strike: 2.5, // Odds/multiplier for betting (e.g., if you bet $100, you win $250)
    premium: 50, // Cost to buy this option
    expiryDate: '2025-07-20T17:00:00Z',
    type: 'call', // Represents betting 'for' the outcome
    collateral: 100, // Implied collateral or stake
    description: 'Bet on Team A to win the European Football Championship'
  },
  {
    id: 'football-option-2',
    eventId: 'football-championship-2025',
    timeline: 'teamBWins',
    strike: 3.0, // Odds/multiplier
    premium: 40,
    expiryDate: '2025-07-20T17:00:00Z',
    type: 'put', // Represents betting 'against' the other outcome, or 'for' this one
    collateral: 100,
    description: 'Bet on Team B to win the European Football Championship'
  },

  // NBA Finals - Celtics Win/Lakers Win
  {
    id: 'basketball-option-1',
    eventId: 'basketball-finals-2025',
    timeline: 'celticsWin',
    strike: 1.8,
    premium: 60,
    expiryDate: '2025-06-25T01:00:00Z',
    type: 'call',
    collateral: 100,
    description: 'Bet on Boston Celtics winning the NBA Finals'
  },
  {
    id: 'basketball-option-2',
    eventId: 'basketball-finals-2025',
    timeline: 'lakersWin',
    strike: 2.2,
    premium: 55,
    expiryDate: '2025-06-25T01:00:00Z',
    type: 'put',
    collateral: 100,
    description: 'Bet on Los Angeles Lakers winning the NBA Finals'
  },

  // Australian Open - Djokovic Wins/Alcaraz Wins
  {
    id: 'tennis-option-1',
    eventId: 'tennis-slam-australian-open',
    timeline: 'djokovicWins',
    strike: 1.5,
    premium: 70,
    expiryDate: '2026-01-28T09:00:00Z',
    type: 'call',
    collateral: 100,
    description: 'Bet on Novak Djokovic to win Australian Open Men\'s Singles'
  },
  {
    id: 'tennis-option-2',
    eventId: 'tennis-slam-australian-open',
    timeline: 'alcarazWins',
    strike: 2.8,
    premium: 35,
    expiryDate: '2026-01-28T09:00:00Z',
    type: 'put',
    collateral: 100,
    description: 'Bet on Carlos Alcaraz to win Australian Open Men\'s Singles'
  }
];

// Mock trades data - Sports Themed
export const trades: TradeType[] = [
  {
    id: 'sport-trade-1',
    optionId: 'football-option-1',
    type: 'buy',
    amount: 1, // Number of options bought
    price: 50, // Premium paid per option
    timestamp: '2025-06-01T14:30:00Z'
  },
  {
    id: 'sport-trade-2',
    optionId: 'basketball-option-2',
    type: 'buy',
    amount: 2,
    price: 55,
    timestamp: '2025-06-02T10:00:00Z'
  },
  {
    id: 'sport-trade-3',
    optionId: 'tennis-option-1',
    type: 'buy',
    amount: 0.5, // Partial option purchase, if supported
    price: 70,
    timestamp: '2025-06-03T09:15:00Z'
  }
];