import React from 'react';
import { TimelineType } from '../../types';
import { useMarket } from '../../context/MarketContext';
import { Clock, ArrowRightLeft } from 'lucide-react';
import Tooltip from './Tooltip';
import { getTimelineLabel } from '../../utils/general';

const TimelineSelector: React.FC = () => {
  const { selectedEvent, selectedTimeline, selectTimeline } = useMarket();
  
  if (!selectedEvent) {
    return null;
  }

  const getTimelineDescription = (timeline: TimelineType) => {
    switch (timeline) {
      case 'trumpWins': return 'Options that execute only if Trump wins the election';
      case 'trumpLoses': return 'Options that execute only if Trump loses the election';
      case 'rateHike': return 'Options that execute only if FED increases rates';
      case 'rateHold': return 'Options that execute only if FED maintains current rates';
      case 'btcUp': return 'Options that execute only if BTC price increases post-halving';
      case 'btcDown': return 'Options that execute only if BTC price decreases post-halving';
      default: return 'Options for this timeline';
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">Timeline Selection</h2>
        
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Clock size={16} className="mr-2" />
          <span>Event Date: {new Date(selectedEvent.date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <ArrowRightLeft size={18} className="text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Trading on a conditional timeline means your trades only execute if that specific outcome occurs.
            If another outcome happens, all collateral and premiums are automatically refunded.
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {selectedEvent.timelines.map((timeline) => (
          <TimelineButton
            key={timeline}
            timeline={timeline}
            label={getTimelineLabel(timeline)}
            description={getTimelineDescription(timeline)}
            isSelected={selectedTimeline === timeline}
            onClick={() => selectTimeline(timeline)}
          />
        ))}
      </div>
    </div>
  );
};

type TimelineButtonProps = {
  timeline: TimelineType;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
};

const TimelineButton: React.FC<TimelineButtonProps> = ({
  label,
  description,
  isSelected,
  onClick,
}) => {
  return (
    <Tooltip content={description}>
      <button
        onClick={onClick}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isSelected 
            ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }
        `}
      >
        {label}
      </button>
    </Tooltip>
  );
};

export default TimelineSelector;