import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { TrendingUp, TrendingDown, ChevronDown, CheckCircle, XCircle, Clock, Info, Dribbble, Trophy, Shield, DollarSign, Percent, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TradeModal from '../components/ui/TradeModal';
import TradeHistoryTable from '../components/ui/TradeHistoryTable';
import { OptionType, TradeHistoryType } from '../types';
import { generateOrderBook } from '../utils/marketDataGenerator'; // Assuming this generates initial raw data
import { getOptionPrice } from '../services/BlockScholesService'; // Still uses this
import IndexedDBService from '../services/IndexedDBService';
import { getTimelineLabel } from '../utils/general';
import { Line } from 'react-chartjs-2'; // For the graph
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,   
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to calculate implied probability from a premium (price for $1 payout)
const calculateImpliedProbability = (premium: number): number => {
  if (premium <= 0 || premium > 1) return 0; // Invalid premium
  return premium; // If premium is already treated as probability (e.g., price of a $1 payout)
  // If premium is a decimal odds, then: return 1 / premium;
};

// Helper to calculate arbitrage percentage
const calculateArbitragePercentage = (callAskPremium: number, putAskPremium: number): number | null => {
  if (callAskPremium <= 0 || putAskPremium <= 0) return null;

  // Assuming callAskPremium and putAskPremium are prices for a $1 payout.
  // The total cost to guarantee a $1 payout is callAskPremium + putAskPremium.
  // If this sum is less than $1, it's an arbitrage.
  const totalCost = callAskPremium + putAskPremium;
  const arbitrageProfit = 1 - totalCost;
  
  if (arbitrageProfit > 0) {
    return (arbitrageProfit / totalCost) * 100; // Profit as a percentage of total stake
  } else {
    return (arbitrageProfit / totalCost) * 100; // Loss as a percentage of total stake (will be negative)
  }
};


// --- Sub-Components for Better Readability ---

// Event Select Button & Dropdown (No change, keeping as is)
interface EventSelectorProps {
  events: any[];
  selectedEvent: any | null;
  selectEvent: (id: string) => void;
  selectTimeline: (timeline: string) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({ events, selectedEvent, selectEvent, selectTimeline }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEventSelect = (event: any) => {
    selectEvent(event.id);
    if (event.resolved) {
      selectTimeline(event.timelines[event.resolved - 1]);
    } else {
      selectTimeline(event.timelines[0]);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex-grow min-w-[200px]" ref={dropdownRef}>
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:translate-y-0 active:shadow-sm ring-2 ring-blue-500/50 dark:ring-blue-300/50 group"
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <span className="truncate text-lg group-hover:text-yellow-300 transition-colors duration-300">
          {selectedEvent ? selectedEvent.name : 'Select a Sporting Event'}
        </span>
        <ChevronDown
          size={24}
          className={`ml-3 transition-transform duration-300 group-hover:text-yellow-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isDropdownOpen && (
        <div className="absolute z-30 w-full mt-2 bg-white dark:bg-gray-800 border border-blue-400 dark:border-blue-600 rounded-xl shadow-2xl max-h-72 overflow-y-auto transform scale-y-100 origin-top animate-fade-in-down backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          {events.map((event) => (
            <button
              key={event.id}
              className={`w-full px-6 py-4 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b last:border-b-0 border-blue-100 dark:border-gray-700 group ${
                selectedEvent?.id === event.id ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''
              }`}
              onClick={() => handleEventSelect(event)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {event.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                    <Clock className="inline-block h-4 w-4 mr-2 text-blue-500" /> {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                {Boolean(event.resolved) && (
                  <span className="px-4 py-1.5 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-400 text-xs font-bold rounded-full shadow-inner">
                    <CheckCircle className="inline-block h-3.5 w-3.5 mr-1" /> Resolved
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Timeline Buttons (No change, keeping as is)
interface TimelineButtonsProps {
  selectedEvent: any;
  selectedTimeline: string | null;
  selectTimeline: (timeline: string) => void;
}

const TimelineButtons: React.FC<TimelineButtonsProps> = ({ selectedEvent, selectedTimeline, selectTimeline }) => (
  <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
    {selectedEvent.timelines.map((timeline: string, i: number) => {
      const isWinningTimeline = Boolean(selectedEvent.resolved) && selectedEvent.resolved - 1 === i;
      const isLosingTimeline = Boolean(selectedEvent.resolved) && selectedEvent.resolved - 1 !== i;

      return (
        <div key={timeline} className="relative group">
          <Button
            variant={selectedTimeline === timeline ? 'primary' : 'outline'}
            onClick={() => !isLosingTimeline && selectTimeline(timeline)}
            className={`whitespace-nowrap rounded-full px-6 py-3.5 text-base font-extrabold transition-all duration-300 transform group-hover:scale-105 active:scale-95
              ${selectedTimeline === timeline
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 hover:from-yellow-500 hover:to-orange-600 shadow-xl ring-2 ring-yellow-300'
                : 'bg-white dark:bg-gray-700 text-blue-700 dark:text-white border-2 border-blue-400 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 shadow-md'
              }
              ${isLosingTimeline ? 'opacity-40 cursor-not-allowed grayscale blur-[0.5px]' : ''}
              ${isWinningTimeline ? 'border-4 border-green-500 shadow-green-lg animate-pulse-green' : ''}
            `}
            disabled={isLosingTimeline}
          >
            {getTimelineLabel(timeline)}
          </Button>
          {isWinningTimeline && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce-in">
              <Trophy size={14} />
            </div>
          )}
          {isLosingTimeline && (
            <div className="absolute top-full left-0 right-0 mt-1.5 text-xs text-center text-red-600 dark:text-red-400 font-semibold whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              Invalid Path
            </div>
          )}
        </div>
      );
    })}
  </div>
);

// New Order Book Table (Arbitrage-focused)
interface ArbitrageOrderBookTableProps {
  orderBook: any[];
  handleOptionClick: (strike: number, type: 'call' | 'put', action: 'buy' | 'sell') => Promise<void>;
  selectedEvent: any;
  selectedTimeline: string;
}

const ArbitrageOrderBookTable: React.FC<ArbitrageOrderBookTableProps> = ({ orderBook, handleOptionClick, selectedEvent, selectedTimeline }) => {
  const chartData = {
    labels: orderBook.map(row => `$${row.strike.toLocaleString()}`),
    datasets: [
      {
        label: 'Implied Probability (Win)',
        data: orderBook.map(row => calculateImpliedProbability(row.call.ask) * 100),
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
      },
      {
        label: 'Implied Probability (Lose)',
        data: orderBook.map(row => calculateImpliedProbability(row.put.ask) * 100),
        borderColor: 'rgb(239, 68, 68)', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: 'rgb(209, 213, 219)', // light gray for dark mode
        }
      },
      title: {
        display: true,
        text: 'Outcome Probability Trends',
        color: 'rgb(209, 213, 219)',
        font: {
            size: 18,
            weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Strike/Target',
                color: 'rgb(156, 163, 175)' // gray-500
            },
            ticks: {
                color: 'rgb(156, 163, 175)'
            },
            grid: {
                color: 'rgba(107, 114, 128, 0.2)' // gray-500 with transparency
            }
        },
        y: {
            title: {
                display: true,
                text: 'Probability (%)',
                color: 'rgb(156, 163, 175)'
            },
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: function(value) {
                    return value + '%';
                },
                color: 'rgb(156, 163, 175)'
            },
            grid: {
                color: 'rgba(107, 114, 128, 0.2)'
            }
        }
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 p-7 shadow-2xl border border-blue-300 dark:border-blue-700 rounded-xl glass-effect">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2 sm:mb-0">
          {selectedEvent.name} <span className="text-blue-600 dark:text-blue-300">|</span> {getTimelineLabel(selectedTimeline)} Arbitrage Opportunities
        </h2>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full shadow-inner flex items-center">
          <Clock size={16} className="mr-2 text-blue-500" />
          Odds last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4 flex items-center">
          <Info size={20} className="mr-2 text-blue-500" /> Implied Probability Chart
        </h3>
        <div className="bg-gray-900 p-4 rounded-lg shadow-inner border border-gray-700">
            <Line data={chartData} options={chartOptions} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
          Visualize the market's implied probabilities for winning and losing across different target scores.
          An arbitrage opportunity occurs when buying both "Win" and "Lose" options for a target results in a guaranteed profit (total implied probability less than 100%).
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750">
            <tr>
              <th rowSpan={2} className="py-4 px-3 text-center text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 border-r border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-center">
                  <DollarSign size={20} className="mr-2" /> Target Score
                </div>
              </th>
              <th colSpan={3} className="py-4 text-center text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 border-r border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-center">
                  <TrendingUp size={20} className="mr-2 animate-pulse-light" />
                  "Win" Outcome (Call Option)
                </div>
              </th>
              <th colSpan={3} className="py-4 text-center text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 border-r border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-center">
                  <TrendingDown size={20} className="mr-2 animate-pulse-light" />
                  "Lose" Outcome (Put Option)
                </div>
              </th>
              <th rowSpan={2} className="py-4 px-3 text-center text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center">
                  <Percent size={20} className="mr-2" /> Arbitrage %
                </div>
              </th>
              <th rowSpan={2} className="py-4 px-3 text-center text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center">
                  <Zap size={20} className="mr-2" /> Action
                </div>
              </th>
            </tr>
            <tr className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              <th className="py-3 px-3 text-center">Buy Price (Ask)</th>
              <th className="py-3 px-3 text-center">Sell Price (Bid)</th>
              <th className="py-3 px-3 text-center border-r border-gray-300 dark:border-gray-600">Implied Prob.</th>
              <th className="py-3 px-3 text-center">Buy Price (Ask)</th>
              <th className="py-3 px-3 text-center">Sell Price (Bid)</th>
              <th className="py-3 px-3 text-center">Implied Prob.</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {orderBook.map((row, index) => {
              const callImpliedProb = calculateImpliedProbability(row.call.ask);
              const putImpliedProb = calculateImpliedProbability(row.put.ask);
              const arbPercentage = calculateArbitragePercentage(row.call.ask, row.put.ask);
              const isArbitrageOpportunity = arbPercentage !== null && arbPercentage > 0;

              return (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    isArbitrageOpportunity ? 'bg-green-50 dark:bg-green-900/20 animate-pulse-once' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center text-lg font-bold text-indigo-700 dark:text-indigo-300 border-r border-gray-300 dark:border-gray-600">
                    ${row.strike.toLocaleString()}
                  </td>

                  {/* Call Option */}
                  <td
                    className="py-3 px-3 text-center text-sm text-red-600 dark:text-red-400 font-semibold cursor-pointer hover:underline transition-colors duration-150"
                    onClick={() => handleOptionClick(row.strike, 'call', 'buy')}
                  >
                    ${row.call.ask.toFixed(4)}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm text-green-600 dark:text-green-400 font-semibold cursor-pointer hover:underline transition-colors duration-150"
                    onClick={() => handleOptionClick(row.strike, 'call', 'sell')}
                  >
                    ${row.call.bid.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-blue-600 dark:text-blue-400 font-medium border-r border-gray-300 dark:border-gray-600">
                    {(callImpliedProb * 100).toFixed(2)}%
                  </td>

                  {/* Put Option */}
                  <td
                    className="py-3 px-3 text-center text-sm text-red-600 dark:text-red-400 font-semibold cursor-pointer hover:underline transition-colors duration-150"
                    onClick={() => handleOptionClick(row.strike, 'put', 'buy')}
                  >
                    ${row.put.ask.toFixed(4)}
                  </td>
                  <td
                    className="py-3 px-3 text-center text-sm text-green-600 dark:text-green-400 font-semibold cursor-pointer hover:underline transition-colors duration-150"
                    onClick={() => handleOptionClick(row.strike, 'put', 'sell')}
                  >
                    ${row.put.bid.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {(putImpliedProb * 100).toFixed(2)}%
                  </td>

                  {/* Arbitrage Percentage */}
                  <td className={`py-3 px-3 text-center text-lg font-bold ${isArbitrageOpportunity ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {arbPercentage !== null ? `${arbPercentage.toFixed(2)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Button
                      variant="secondary"
                      onClick={() => handleOptionClick(row.strike, 'call', 'buy')} // Can trigger a combined modal or just buy Call
                      className="px-4 py-2 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Trade
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {orderBook.some(row => {
        const arb = calculateArbitragePercentage(row.call.ask, row.put.ask);
        return arb !== null && arb > 0;
      }) && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-400 rounded-lg flex items-center justify-center font-semibold text-lg animate-fade-in">
          <CheckCircle className="mr-3" size={24} /> Arbitrage Opportunities Found! Act Fast!
        </div>
      )}
      {!orderBook.some(row => {
        const arb = calculateArbitragePercentage(row.call.ask, row.put.ask);
        return arb !== null && arb > 0;
      }) && (
          <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-400 rounded-lg flex items-center justify-center font-semibold text-lg animate-fade-in">
              <Info className="mr-3" size={24} /> No immediate arbitrage opportunities. Keep an eye on the odds!
          </div>
      )}
    </Card>
  );
};


// --- Main Markets Component (updated to use new table) ---

const Markets: React.FC = () => {
  const { selectedEvent, selectedTimeline, events, loading, error, selectEvent, selectTimeline } = useMarket();
  const { isConnected, signer, connectWallet } = useWallet();
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'call' | 'put'>('call');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [orderBook, setOrderBook] = useState(generateOrderBook());
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryType[]>([]);

  useEffect(() => {
    if (selectedEvent && selectedTimeline) {
      // Simulate price changes for a more dynamic arbitrage market
      const interval = setInterval(() => {
        setOrderBook(generateOrderBook());
      }, 5000); // Regenerate order book every 5 seconds for demo
      loadTradeHistory();

      return () => clearInterval(interval); // Cleanup interval
    }
  }, [selectedEvent, selectedTimeline]); // Dependency on selectedEvent, selectedTimeline

  const loadTradeHistory = async () => {
    if (selectedEvent && selectedTimeline) {
      const db = IndexedDBService.getInstance();
      const trades = await db.getTradesByEventAndTimeline(selectedEvent.id, selectedTimeline);
      setTradeHistory(trades);
    }
  };

  const handleOptionClick = async (strike: number, type: 'call' | 'put', action: 'buy' | 'sell') => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setTradeType(type);
    setTradeAction(action);

    // Dynamic ID for options based on event, timeline, strike, type
    const optionId = `${selectedEvent?.id || 'unknown'}-${selectedTimeline || 'unknown'}-${type}-${strike}`;

    try {
      // In a real scenario, getOptionPrice would fetch live prices from a blockchain oracle or a liquidity pool.
      // For this demo, it's a simulated Black-Scholes price.
      const premium = await getOptionPrice(strike, type === 'call' ? 'C' : 'P');

      const option: OptionType = {
        id: optionId,
        eventId: selectedEvent?.id || '',
        timeline: selectedTimeline || '',
        strike: strike,
        premium: premium,
        expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks expiry
        type: type,
        collateral: strike * 0.1, // Example collateral
        description: `${type.toUpperCase()} option for ${getTimelineLabel(selectedTimeline || 'N/A')} at target $${strike.toLocaleString()}`
      };

      setSelectedOption(option);
      setIsTradeModalOpen(true);
    } catch (error) {
      console.error('Error fetching option premium, using fallback:', error);
      // Fallback premium if API fails (e.g., 0.8% of strike for quick demo)
      const fallbackPremium = strike * 0.008; // This premium is for a $1 payout.
      const option: OptionType = {
        id: optionId,
        eventId: selectedEvent?.id || '',
        timeline: selectedTimeline || '',
        strike: strike,
        premium: fallbackPremium,
        expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        type: type,
        collateral: strike * 0.1,
        description: `${type.toUpperCase()} option for ${getTimelineLabel(selectedTimeline || 'N/A')} at target $${strike.toLocaleString()} (Fallback Premium)`
      };
      setSelectedOption(option);
      setIsTradeModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-gray-700 dark:text-gray-300 animate-fade-in-up">
          <Dribbble className="animate-bounce text-blue-600 dark:text-blue-400 mb-4" size={60} />
          <p className="text-2xl font-bold">Loading SportPulse Data...</p>
          <p className="text-lg mt-2">Preparing the arenas for your predictions.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-950 flex items-center justify-center p-8">
        <div className="flex flex-col items-center text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-red-300 dark:border-red-700 animate-zoom-in">
          <XCircle className="text-red-600 dark:text-red-400 mb-4 animate-shake" size={60} />
          <h2 className="text-3xl font-extrabold mb-2">Error Loading Markets!</h2>
          <p className="text-lg text-center leading-relaxed">
            We couldn't fetch the latest sports data. Please check your connection or try again later.
          </p>
          <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">Details: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Shapes/Gradients for Visual Interest */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-yellow-200 dark:bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Event & Timeline Selection Section */}
        <Card className="bg-white dark:bg-gray-800 p-7 shadow-2xl border border-blue-300 dark:border-blue-700 rounded-xl glass-effect">
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 text-center">
            Set Your Game Plan
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-5">
            <EventSelector
              events={events}
              selectedEvent={selectedEvent}
              selectEvent={selectEvent}
              selectTimeline={selectTimeline}
            />
            {selectedEvent && (
              <TimelineButtons
                selectedEvent={selectedEvent}
                selectedTimeline={selectedTimeline}
                selectTimeline={selectTimeline}
              />
            )}
          </div>
        </Card>

        {selectedEvent && selectedTimeline ? (
          <div className="space-y-10">
            {/* Order Book Section (now Arbitrage focused) */}
            <ArbitrageOrderBookTable
              orderBook={orderBook}
              handleOptionClick={handleOptionClick}
              selectedEvent={selectedEvent}
              selectedTimeline={selectedTimeline}
            />

            {/* Trade History Section */}
            <Card className="bg-white dark:bg-gray-800 p-7 shadow-2xl border border-blue-300 dark:border-blue-700 rounded-xl glass-effect">
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6 text-center">
                Your Betting History
              </h2>
              <TradeHistoryTable trades={tradeHistory} />
            </Card>

            {/* Information Box */}
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-xl p-6 flex items-start space-x-4 shadow-xl animate-fade-in-up">
              <Shield className="mt-1 text-indigo-600 dark:text-indigo-400" size={28} />
              <div>
                <h3 className="font-extrabold text-xl mb-2">Conditional Trading on SportPulse</h3>
                <p className="text-base leading-relaxed">
                  On SportPulse, your wagers are placed on specific real-world "timelines" or scenarios. Your trade becomes active and settles *only if* your chosen timeline occurs. If a different outcome happens, your initial collateral and premiums are automatically refunded – ensuring a transparent and fair betting experience every time.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-12 text-center border border-blue-300 dark:border-blue-700 glass-effect animate-zoom-in">
            <h3 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-5">
              Welcome to the SportPulse Exchange!
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Ignite your predictive power! Select a major sporting event from the "Set Your Game Plan" section above, then choose a specific game outcome to unlock live odds and place your strategic bets. The arena awaits your insight!
            </p>
            <Button
              onClick={() => { /* Logic to open event selector if needed, or simply make it visible */ }}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition duration-300 hover:scale-105 animate-bounce-subtle"
            >
              Start Predicting Now! <Dribbble className="ml-3 inline-block" size={24} />
            </Button>
          </div>
        )}

        {selectedOption && (
          <TradeModal
            option={selectedOption}
            isOpen={isTradeModalOpen}
            onClose={() => {
              setIsTradeModalOpen(false);
              setSelectedOption(null);
              loadTradeHistory();
            }}
            initialSide={tradeAction}
            signer={signer}
          />
        )}
      </div>
    </div>
  );
};

export default Markets;