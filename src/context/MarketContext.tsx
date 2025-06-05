import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventType, OptionType } from '../types';
import MarketService from '../services/MarketService';

type MarketContextType = {
  selectedEvent: EventType | null;
  selectedTimeline: string | null;
  activeOptions: OptionType[];
  events: EventType[];
  options: OptionType[];
  selectEvent: (eventId: string | null) => void;
  selectTimeline: (timeline: string | null) => void;
  loading: boolean;
  error: string | null;
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marketService = MarketService.getInstance();
        const [fetchedEvents, fetchedOptions] = await Promise.all([
          marketService.getEvents(),
          marketService.getOptions()
        ]);
        
        setEvents(fetchedEvents);
        setOptions(fetchedOptions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch market data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectEvent = (eventId: string | null) => {
    if (!eventId) {
      setSelectedEvent(null);
      setSelectedTimeline(null);
      return;
    }
    
    const event = events.find(e => e.id === eventId) || null;
    setSelectedEvent(event);
    
    if (event && event.timelines.length > 0) {
      setSelectedTimeline(event.timelines[0]);
    } else {
      setSelectedTimeline(null);
    }
  };

  const selectTimeline = (timeline: string | null) => {
    setSelectedTimeline(timeline);
  };

  const activeOptions = options.filter(option => 
    selectedEvent && 
    option.eventId === selectedEvent.id && 
    option.timeline === selectedTimeline
  );

  return (
    <MarketContext.Provider value={{
      selectedEvent,
      selectedTimeline,
      activeOptions,
      events,
      options,
      selectEvent,
      selectTimeline,
      loading,
      error
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};