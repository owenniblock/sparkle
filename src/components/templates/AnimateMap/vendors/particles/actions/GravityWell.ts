/**
 * The GravityWell action applies a force on the particle to draw it towards
 * a single point. The force applied is inversely proportional to the square
 * of the distance from the particle to the point, in accordance with Newton's
 * law of gravity.
 *
 * <p>This simulates the effect of gravity over large distances (as between
 * planets, for example). To simulate the effect of gravity at the surface
 * of the eacrth, use an Acceleration action with the direction of force
 * downwards.</p>
 *
 * @see Acceleration
 */

import Emitter from "../emitters/Emitter";
import Particle2D from "../particles/Particle2D";
import Action from "./Action";

export default class GravityWell extends Action {
  private _x: number;
  private _y: number;
  private _power: number;
  private _epsilonSq: number;
  private _gravityConst = 10000; // just scales the power to a more reasonable number

  /**
   * The constructor creates a GravityWell action for use by an emitter.
   * To add a GravityWell to all particles created by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.common.emitters.Emitter#addAction()
   *
   * @param power The strength of the gravity force - larger numbers produce a
   * stronger force.
   * @param x The x coordinate of the point towards which the force draws
   * the particles.
   * @param y The y coordinate of the point towards which the force draws
   * the particles.
   * @param epsilon The minimum distance for which gravity is calculated.
   * Particles closer than this distance experience a gravity force as if
   * they were this distance away. This stops the gravity effect blowing
   * up as distances get small. For realistic gravity effects you will want
   * a small epsilon ( ~1 ), but for stable visual effects a larger
   * epsilon (~100) is often better.
   */
  constructor(power = 0, x = 0, y = 0, epsilon = 100) {
    super();
    this._power = power * this._gravityConst;
    this._x = x;
    this._y = y;
    this._epsilonSq = epsilon * epsilon;
  }

  /**
   * The strength of the gravity force - larger numbers produce a
   * stronger force.
   */
  public get power(): number {
    return this._power / this._gravityConst;
  }
  public set power(value: number) {
    this._power = value * this._gravityConst;
  }

  /**
   * The x coordinate of the point towards which the force draws
   * the particles.
   */
  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value;
  }

  /**
   * The y coordinate of the point towards which the force draws
   * the particles.
   */
  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
  }

  /**
   * The minimum distance for which the gravity force is calculated.
   * Particles closer than this distance experience the gravity as if
   * they were this distance away. This stops the gravity effect blowing
   * up as distances get small.  For realistic gravity effects you will want
   * a small epsilon ( ~1 ), but for stable visual effects a larger
   * epsilon (~100) is often better.
   */
  public get epsilon(): number {
    return Math.sqrt(this._epsilonSq);
  }
  public set epsilon(value: number) {
    this._epsilonSq = value * value;
  }

  /**
   * Calculates the gravity force on the particle and applies it for
   * the period of time indicated.
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
  public update(emitter: Emitter, particle: Particle2D, time: number): void {
    if (particle.mass === 0) {
      return;
    }
    const x = this._x - particle.x;
    const y = this._y - particle.y;
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
