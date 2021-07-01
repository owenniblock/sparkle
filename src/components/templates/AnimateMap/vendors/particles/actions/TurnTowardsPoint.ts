import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import Action from "./Action";

export default class TurnTowardsPoint extends Action {
  private _x: number;
  private _y: number;
  private _power: number;

  /**
   * The constructor creates a TurnTowardsPoint action for use by an emitter.
   * To add a TurnTowardsPoint to all particles created by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.common.emitters.Emitter#addAction()
   *
   * @param power The strength of the turn action. Higher values produce a sharper turn.
   * @param x The x coordinate of the point towards which the particle turns.
   * @param y The y coordinate of the point towards which the particle turns.
   */
  constructor(x = 0, y = 0, power = 0) {
    super();
    this._power = power;
    this._x = x;
    this._y = y;
  }

  /**
   * The strength of the turn action. Higher values produce a sharper turn.
   */
  public get power(): number {
    return this._power;
  }
  public set power(value: number) {
    this._power = value;
  }

  /**
   * The x coordinate of the point that the particle turns towards.
   */
  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value;
  }

  /**
   * The y coordinate of the point that the particle turns towards.
   */
  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
  }

  /**
   * Calculates the direction to the focus point and turns the particle towards
   * this direction.
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
    const velLength = Math.sqrt(
      particle.velX * particle.velX + particle.velY * particle.velY
    );
    const dx = particle.velX / velLength;
    const dy = particle.velY / velLength;
    const acc = this.power * time;
    let targetX = this._x - particle.x;
    let targetY = this._y - particle.y;
    const len = Math.sqrt(targetX * targetX + targetY * targetY);
    if (len === 0) {
      return;
    }
    targetX /= len;
    targetY /= len;
    const dot = targetX * dx + targetY * dy;
    const perpX = targetX - dx * dot;
    const perpY = targetY - dy * dot;
    let factor = acc / Math.sqrt(perpX * perpX + perpY * perpY);
    particle.velX += perpX * factor;
    particle.velY += perpY * factor;
    factor =
      velLength /
      Math.sqrt(particle.velX * particle.velX + particle.velY * particle.velY);
    particle.velX *= factor;
    particle.velY *= factor;
  }
}
