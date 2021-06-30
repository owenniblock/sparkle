export default class TickProvider {
  private rafId = 0;
  private previousTime = 0;

  private _update: Function;
  constructor(update: Function) {
    this._update = update;
  }

  public start(): void {
    this.rafId = window.requestAnimationFrame(this.dispatchTick);
    this.previousTime = performance.now();
  }

  public release(): void {
    window.cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private dispatchTick = (): void => {
    this.rafId = window.requestAnimationFrame(this.dispatchTick);
    const temp = this.previousTime;
    this.previousTime = performance.now();
    this._update((this.previousTime - temp) / 1000);
  };
}
