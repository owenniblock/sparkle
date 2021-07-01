import Emitter from "../emitters/Emitter";

export default interface Counter {
  /**
   * The startEmitter method is called when the emitter starts.
   *
   * <p>This method is called within the emitter's start method
   * and need not be called by the user.</p>
   *
   * @param emitter The emitter.
   * @return The number of particles the emitter should emit when it starts.
   */
  startEmitter(emitter: Emitter): number;

  /**
   * The updateEmitter method is called every frame after the
   * emitter has started.
   *
   * <p>This method is called within the emitter's update loop and need not
   * be called by the user.</p>
   *
   * @param emitter The emitter
   * @param time The time, in seconds, since the previous call to this method.
   * @return The number of particles the emitter should emit
   * at this time.
   */
  updateEmitter(emitter: Emitter, time: Number): number;

  /**
   * Stops the counter instructing the emitter to emit particles
   */
  stop(): void;

  /**
   * Resumes the counter after a stop
   */
  resume(): void;

  /**
   * Indicates if the counter has emitted all its particles
   */
  complete: boolean;

  /**
   * Indicates if the counter is currently emitting particles
   */
  running: boolean;
}
