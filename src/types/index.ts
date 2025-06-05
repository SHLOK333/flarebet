export type EventType = {
  id: string;
  name: string;
  description: string;
  date: string; // ISO date string
  timelines: string[];
  resolved: boolean;
  outcome?: number; // 0 for pending, 1 for outcome1, 2 for outcome2
};

export type OptionType = {
  id: string;
  eventId: string;
  timeline: string;
  strike: number;
  premium: number;
  expiryDate: string; // ISO date string
  type: 'call' | 'put';
  collateral: number;
  description: string;
};

export type TradeType = {
  id: string;
  optionId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: string;
};

export type TradeHistoryType = {
  id?: number;
  eventId: string;
  timeline: string;
  type: 'call' | 'put';
  side: 'buy' | 'sell';
  strike: number;
  premium: number;
  amount: number;
  timestamp: string;
};

export type ThemeType = 'light' | 'dark';