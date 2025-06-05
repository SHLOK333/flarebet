import React from 'react';
import { EventType } from '../../types';
import Card from './Card';
import { useMarket } from '../../context/MarketContext';
import { Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatters';

type EventCardProps = {
  event: EventType;
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { selectEvent, selectedEvent } = useMarket();
  const isSelected = selectedEvent?.id === event.id;
  
  const eventDate = new Date(event.date);
  const timeToEvent = formatDistanceToNow(eventDate);
  
  return (
    <Card 
      className={`w-full ${isSelected ? 'border-2 border-indigo-500 dark:border-indigo-400' : ''}`}
      hover={!isSelected}
      onClick={() => selectEvent(event.id)}
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{event.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Calendar size={16} className="mr-2" />
          <span>{eventDate.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock size={16} className="mr-2" />
          <span>{timeToEvent}</span>
        </div>
        
        {event.resolved ? (
          <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm">
            Resolved: {event.outcome === 'trumpWins' ? 'Trump Wins' : 'Trump Loses'}
          </div>
        ) : (
          <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
            Pending Resolution
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventCard;