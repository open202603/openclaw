export class AccountReadinessService {
  constructor(
    private readonly credentials: {
      binance: { enabled: boolean };
      deribit: { enabled: boolean };
      okx: { enabled: boolean };
      bybit: { enabled: boolean };
    },
  ) {}

  getSummary() {
    return [
      { venue: 'binance-options', enabled: this.credentials.binance.enabled, mode: this.credentials.binance.enabled ? 'credentials-present' : 'not-configured' },
      { venue: 'deribit', enabled: this.credentials.deribit.enabled, mode: this.credentials.deribit.enabled ? 'credentials-present' : 'not-configured' },
      { venue: 'okx-options', enabled: this.credentials.okx.enabled, mode: this.credentials.okx.enabled ? 'credentials-present' : 'not-configured' },
      { venue: 'bybit-options', enabled: this.credentials.bybit.enabled, mode: this.credentials.bybit.enabled ? 'credentials-present' : 'not-configured' },
    ];
  }
}
