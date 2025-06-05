import { EventType, OptionType, TradeType } from '../types';
import * as flareEnoughContract from '../config/FlareEnough.json';
import { Contract } from 'ethers';
import { CONTRACTS, NETWORK } from '../config';
import { ethers } from 'ethers';

// Mock initial data
const mockEvents: EventType[] = [];

const mockOptions: OptionType[] = [
  ];

const mockTrades: TradeType[] = [];

class MarketService {
  private static instance: MarketService;
  private events: any = null;
  private options: OptionType[] | null = null;
  private trades: TradeType[] | null = null;

  private constructor() {}

  public static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  // Mock fetch function - to be replaced with real API calls later
  private async fetchMarketData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      events: mockEvents,
      options: mockOptions,
      trades: mockTrades
    };
  }

  public async getEvents(): Promise<EventType[]> {
    if (!this.events) {
      const provider = new ethers.providers.JsonRpcProvider(NETWORK.COSTON.rpcUrl);
      const contract = new Contract(
        CONTRACTS.FLARE_ENOUGH,
        flareEnoughContract.abi,
        provider
      );
      const count = await contract.getMarketsCount();
      this.events = [];
      for (let i = 0; i < count; i++) {
        const event = await contract.getMarket(i);
        this.events.push({
          id: i+1,
          name: event[0],
          description: event[1],
          timelines: [event[2], event[3]], 
          date: new Date(event[6] * 1).toISOString(),
          resolved: event[7],
        });
        this.events = Array.from(
         new Map(this.events.map((item:any) => [item.id, item])).values()
        );
      }
    }
    return this.events;
  }

  public async getOptions(): Promise<OptionType[]> {
    if (!this.options) {
      const data = await this.fetchMarketData();
      this.options = data.options;
    }
    return this.options;
  }

  public async getTrades(): Promise<TradeType[]> {
    if (!this.trades) {
      const data = await this.fetchMarketData();
      this.trades = data.trades;
    }
    return this.trades;
  }

  // Helper method to get options for a specific event and timeline
  public async getEventOptions(eventId: string, timeline: string): Promise<OptionType[]> {
    const options = await this.getOptions();
    return options.filter(option => 
      option.eventId === eventId && 
      option.timeline === timeline
    );
  }

  // Method to refresh the cache if needed
  public async refreshData() {
    const data = await this.fetchMarketData();
    this.events = data.events;
    this.options = data.options;
    this.trades = data.trades;
  }
}

export default MarketService;