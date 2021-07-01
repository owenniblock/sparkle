import Emitter from "../emitters/Emitter";
import Counter from "./Counter";

export default class Steady implements Counter {
  private _timeToNext = 0;
  private _rate = 0;
  private _rateInv = 0;
  private _running = false;

  /**
   * The constructor creates a Steady counter for use by an emitter. To
   * add a Steady counter to an emitter use the emitter's counter property.
   *
   * @param rate The number of particles to emit per second.
   *
   * @see org.flintparticles.common.emitter.Emitter.counter
   */
  public Steady(rate = 0) {
    this._running = false;
    this.rate = rate;
  }

  /**
   * Stops the emitter from emitting particles
   */
  public stop(): void {
    this._running = false;
  }

  /**
   * Resumes the emitter emitting particles after a stop
   */
  public resume(): void {
    this._running = true;
  }

  /**
   * The number of particles to emit per second.
   */
  public get rate(): number {
    return this._rate;
  }
  public set rate(value: number) {
    if (!value || value < 0) {
      value = 0;
    }
    if (this._rate !== value) {
      if (this._rate && value) {
        var timePassed: number = this._rateInv - this._timeToNext;
        this._rate = value;
        this._rateInv = value ? 1 / value : Number.MAX_VALUE;
        this._timeToNext = Math.max(this._rateInv - timePassed, 0);
      } else {
        this._rate = value;
        this._rateInv = value ? 1 / value : Number.MAX_VALUE;
        this._timeToNext = this._rateInv;
      }
    }
  }

  /**
   * Initilizes the counter. Returns 0 to indicate that the emitter should
   * emit no particles when it starts.
   *
   * <p>This method is called within the emitter's start method
   * and need not be called by the user.</p>
   *
   * @param emitter The emitter.
   * @return 0
   *
   * @see org.flintparticles.common.counters.Counter#startEmitter()
   */
  public startEmitter(emitter: Emitter): number {
    this._running = true;
    this._timeToNext = this._rateInv;
    return 0;
  }

  /**
   * Uses the time, rateMin and rateMax to calculate how many
   * particles the emitter should emit now.
   *
   * <p>This method is called within the emitter's update loop and need not
   * be called by the user.</p>
   *
   * @param emitter The emitter.
   * @param time The time, in seconds, since the previous call to this method.
   * @return the number of particles the emitter should create.
   *
   * @see org.flintparticles.common.counters.Counter#updateEmitter()
   */
  public updateEmitter(emitter: Emitter, time: number): number {
    if (!this._running) {
      return 0;
    }
    var count = 0;
    this._timeToNext -= time;
    while (this._timeToNext <= 0) {
      ++count;
      this._timeToNext += this._rateInv;
    }
    return count;
  }

  /**
   * Indicates if the counter has emitted all its particles. For this counter
   * this will always be false.
   */
  public get complete(): boolean {
    return false;
  }

  /**
   * Indicates if the counter is currently emitting particles
   */
  public get running(): boolean {
    return this._running;
  }
}
