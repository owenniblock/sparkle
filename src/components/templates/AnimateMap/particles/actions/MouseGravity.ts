import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import { Point } from "../zones/Zone2D";
import Action from "./Action";

export default class MouseGravity extends Action {
  protected _power: number;
  protected _epsilonSq: number;
  protected _gravityConst = 10000; // scales the power to more useable levels
  protected _renderer: Point;

  /**
   * The constructor creates a MouseGravity action for use by an emitter.
   * To add a MouseGravity to all particles created by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.common.emitters.Emitter#addAction()
   *
   * @param power The strength of the gravity force - larger numbers produce a
   * stronger force.
   * @param renderer The display object whose coordinate system the mouse
   * position is converted to. This is usually the renderer for the particle
   * system created by the emitter.
   * @param epsilon The minimum distance for which gravity is calculated.
   * Particles closer than this distance experience a gravity force as if
   * they were this distance away. This stops the gravity effect blowing up
   * as distances get small. For realistic gravity effects you will want a
   * small epsilon ( ~1 ), but for stable visual effects a larger epsilon
   * (~100) is often better.
   */
  constructor(power = 0, renderer: Point, epsilon = 100) {
    super();
    this._power = power * this._gravityConst;
    this._epsilonSq = epsilon * epsilon;
    this._renderer = renderer;
  }

  /**
   * The strength of the gravity force.
   */
  public get power(): number {
    return this._power / this._gravityConst;
  }
  public set power(value: number) {
    this._power = value * this._gravityConst;
  }

  /**
   * The display object whose coordinate system the mouse position is
   * converted to. This is usually the renderer for the particle system
   * created by the emitter.
   */
  public get renderer(): Point {
    return this._renderer;
  }
  public set renderer(value: Point) {
    this._renderer = value;
  }

  /**
   * The minimum distance for which the gravity force is calculated.
   * Particles closer than this distance experience the gravity as it they were
   * this distance away. This stops the gravity effect blowing up as distances get
   * small.
   */
  public get epsilon(): number {
    return Math.sqrt(this._epsilonSq);
  }
  public set epsilon(value: number) {
    this._epsilonSq = value * value;
  }

  /**
   * Calculates the gravity force on the particle and applies it for the
   * period of time indicated.
   *
   * <p>This method is called by the emitter and need not be called by the
   * user.</p>
   *
   * @param emitter The Emitter that created the particle.
   * @param particle The particle to be updated.
   * @param time The duration of the frame - used for time based updates.
   *
   * @see org.flintparticles.common.actions.Action#update()
   */
  public update(emitter: Emitter, particle: Particle, time: number): void {
    const x = this._renderer.x - particle.x;
    const y = this._renderer.y - particle.y;
    let dSq = x * x + y * y;
    if (dSq === 0) {
      return;
    }
    const d = Math.sqrt(dSq);
    if (dSq < this._epsilonSq) dSq = this._epsilonSq;
    const factor = (this._power * time) / (dSq * d);
    particle.velX += x * factor;
    particle.velY += y * factor;
  }
}
