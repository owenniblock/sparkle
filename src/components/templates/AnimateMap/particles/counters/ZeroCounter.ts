import Emitter from "../emitters/Emitter";
import Counter from "./Counter";

export default class ZeroCounter implements Counter {
  /**
   * Returns 0 to indicate that the emitter should emit no particles when it
   * starts.
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
    return 0;
  }

  /**
   * Returns 0 to indicate that the emitter should emit no particles.
   *
   * <p>This method is called within the emitter's update loop and need not
   * be called by the user.</p>
   *
   * @param emitter The emitter.
   * @param time The time, in seconds, since the previous call to this method.
   * @return 0
   *
   * @see org.flintparticles.common.counters.Counter#updateEmitter()
   */
  public updateEmitter(emitter: Emitter, time: number): number {
    return 0;
  }

  /**
   * Does nothing
   */
  public stop(): void {
    return;
  }

  /**
   * Does nothing
   */
  public resume(): void {
    return;
  }

  /**
   * Indicates if the counter has emitted all its particles. For the ZeroCounter
   * this will always be true.
   */
  public get complete(): boolean {
    return true;
  }

  /**
   * Indicates if the counter is currently emitting particles
   */
  public get running(): boolean {
    return false;
  }
}
