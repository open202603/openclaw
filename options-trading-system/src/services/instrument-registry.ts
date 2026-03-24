import type { NormalizedOptionInstrument } from '../core/types.js';
import type { VenueAdapter } from '../core/venue-adapter.js';

export class InstrumentRegistry {
  private readonly instruments = new Map<string, NormalizedOptionInstrument>();

  constructor(private readonly adapters: VenueAdapter[]) {}

  async loadAll() {
    for (const adapter of this.adapters) {
      const instruments = await adapter.loadInstruments();
      for (const instrument of instruments) {
        this.instruments.set(`${instrument.venue}:${instrument.symbol}`, instrument);
      }
    }

    console.log('[instruments] loaded', this.instruments.size, 'normalized option instruments');
  }

  getAll() {
    return [...this.instruments.values()];
  }
}
