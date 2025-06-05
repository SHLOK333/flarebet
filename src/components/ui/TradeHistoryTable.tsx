import React from 'react';
import { TradeHistoryType } from '../types';
import { formatDistanceToNow } from '../../utils/formatters';

type TradeHistoryTableProps = {
  trades: TradeHistoryType[];
};

const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ trades }) => {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No trades found for this event and timeline
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Side</th>
            <th className="py-3 px-4">Strike</th>
            <th className="py-3 px-4">Premium</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Total</th>
            <th className="py-3 px-4">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr 
              key={trade.id} 
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.type === 'call'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {trade.type.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  trade.side === 'buy'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                }`}>
                  {trade.side.toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4">${trade.strike.toLocaleString()}</td>
              <td className="py-3 px-4">${trade.premium.toFixed(4)}</td>
              <td className="py-3 px-4">{trade.amount.toFixed(2)}</td>
              <td className="py-3 px-4">
                ${(trade.premium * trade.amount).toFixed(4)}
              </td>
              <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                {new Date(trade.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistoryTable;