import { TimelineType } from '../types';

export const getTimelineLabel = (timeline: TimelineType | string): string => {
  switch (timeline) {
    case 'trumpWins': return 'Trump Wins';
    case 'trumpLoses': return 'Trump Loses';
    case 'rateHike': return 'Rate Hike';
    case 'rateHold': return 'Rate Hold';
    case 'btcUp': return 'BTC Up';
    case 'btcDown': return 'BTC Down';
    default: return timeline;
  }
};