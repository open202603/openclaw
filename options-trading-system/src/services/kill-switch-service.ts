export class KillSwitchService {
  private enabled: boolean;

  constructor(initialState = false) {
    this.enabled = initialState;
  }

  isEnabled() {
    return this.enabled;
  }

  engage(reason?: string) {
    this.enabled = true;
    console.warn('[kill-switch] engaged', reason ?? 'no reason provided');
  }

  release(reason?: string) {
    this.enabled = false;
    console.warn('[kill-switch] released', reason ?? 'no reason provided');
  }
}
