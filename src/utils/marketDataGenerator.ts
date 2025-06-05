import { OptionType } from '../types';

type OrderBookEntry = {
  strike: number;
  call: {
    size: number;
    iv: number;
    bid: number;
    ask: number;
    ivAsk: number;
    askSize: number;
  };
  put: {
    size: number;
    iv: number;
    bid: number;
    ask: number;
    ivAsk: number;
    askSize: number;
  };
};

const generateRandomValue = (min: number, max: number, decimals = 4): number => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const generateIV = (strike: number, currentPrice: number): number => {
  // Higher IV for strikes further from current price
  const distance = Math.abs(strike - currentPrice) / currentPrice;
  const baseIV = 45; // Base IV of 45%
  const variation = distance * 15; // Increase IV by up to 15% based on distance
  return generateRandomValue(baseIV - 5 + variation, baseIV + 5 + variation, 1);
};

const generateSize = (): number => {
  // Generate realistic looking sizes
  const sizes = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

export const generateOrderBook = (
  currentPrice: number = 85000, // Current BTC price
  strikes: number[] = []
): OrderBookEntry[] => {
  // If no strikes provided, generate them around current price
  if (strikes.length === 0) {
    const strikeStep = 2000; // $2000 steps
    const numStrikes = 15;
    const lowestStrike = currentPrice - (strikeStep * Math.floor(numStrikes / 2));
    
    for (let i = 0; i < numStrikes; i++) {
      strikes.push(lowestStrike + (i * strikeStep));
    }
  }

  return strikes.map(strike => {
    const distanceFromCurrent = Math.abs(strike - currentPrice) / currentPrice;
    const basePrice = Math.max(0.001, 1 - distanceFromCurrent) * (currentPrice * 0.1);
    
    // Generate call data
    const callIV = generateIV(strike, currentPrice);
    const callBid = generateRandomValue(basePrice * 0.95, basePrice * 0.98, 4);
    const callAsk = generateRandomValue(basePrice * 1.02, basePrice * 1.05, 4);
    
    // Generate put data
    const putIV = generateIV(strike, currentPrice);
    const putBid = generateRandomValue(basePrice * 0.95, basePrice * 0.98, 4);
    const putAsk = generateRandomValue(basePrice * 1.02, basePrice * 1.05, 4);

    return {
      strike,
      call: {
        size: generateSize(),
        iv: callIV,
        bid: callBid,
        ask: callAsk,
        ivAsk: callIV + generateRandomValue(0.5, 1.5, 1),
        askSize: generateSize()
      },
      put: {
        size: generateSize(),
        iv: putIV,
        bid: putBid,
        ask: putAsk,
        ivAsk: putIV + generateRandomValue(0.5, 1.5, 1),
        askSize: generateSize()
      }
    };
  }).sort((a, b) => b.strike - a.strike); // Sort by strike price descending
};