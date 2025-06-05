import React, { useState } from 'react';
import { OptionType } from '../../types';
import Card from './Card';
import Button from './Button';
import { ArrowUpDown, Calendar, DollarSign, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Tooltip from './Tooltip';

type OptionCardProps = {
  option: OptionType;
};

const OptionCard: React.FC<OptionCardProps> = ({ option }) => {
  const [showTradeModal, setShowTradeModal] = useState(false);
  
  const expiryDate = new Date(option.expiryDate);
  
  return (
    <Card className="w-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <span className={`text-sm font-medium px-2 py-1 rounded flex items-center ${
              option.type === 'call' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {option.type === 'call' ? (
                <TrendingUp size={14} className="mr-1" />
              ) : (
                <TrendingDown size={14} className="mr-1" />
              )}
              {option.type.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar size={16} className="mr-1" />
            <span>{expiryDate.toLocaleDateString()}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {option.description}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Strike Price</span>
              <Tooltip content="The price at which the option can be exercised">
                <HelpCircle size={14} className="ml-1" />
              </Tooltip>
            </div>
            <div className="text-base font-semibold flex items-center">
              <DollarSign size={16} className="mr-1" />
              {option.strike.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Premium</span>
              <Tooltip content="The cost to purchase this option">
                <HelpCircle size={14} className="ml-1" />
              </Tooltip>
            </div>
            <div className="text-base font-semibold flex items-center">
              <DollarSign size={16} className="mr-1" />
              {option.premium.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Collateral</span>
              <Tooltip content="Amount required to secure this option position">
                <HelpCircle size={14} className="ml-1" />
              </Tooltip>
            </div>
            <div className="text-base font-semibold flex items-center">
              <DollarSign size={16} className="mr-1" />
              {option.collateral.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Timeline</span>
              <Tooltip content="The conditional event outcome for this option">
                <HelpCircle size={14} className="ml-1" />
              </Tooltip>
            </div>
            <div className="text-base font-semibold">
              {option.timeline === 'trumpWins' ? 'Trump Wins' : 'Trump Loses'}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={() => setShowTradeModal(true)}
          >
            <div className="flex items-center justify-center">
              <ArrowUpDown size={16} className="mr-2" />
              Trade
            </div>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OptionCard;