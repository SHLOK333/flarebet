import { TradeHistoryType } from '../types';

class IndexedDBService {
  private static instance: IndexedDBService;
  private dbName = 'FlareEnoughDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  public async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('trades')) {
          const store = db.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
          store.createIndex('eventId', 'eventId', { unique: false });
          store.createIndex('timeline', 'timeline', { unique: false });
        }
      };
    });
  }

  public async addTrade(trade: Omit<TradeHistoryType, 'id'>): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readwrite');
      const store = transaction.objectStore('trades');
      const request = store.add({
        ...trade,
        timestamp: new Date().toISOString()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getTradesByEventAndTimeline(eventId: string, timeline: string): Promise<TradeHistoryType[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readonly');
      const store = transaction.objectStore('trades');
      const request = store.getAll();

      request.onsuccess = () => {
        const trades = request.result.filter(
          trade => trade.eventId === eventId && trade.timeline === timeline
        );
        resolve(trades);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export default IndexedDBService;