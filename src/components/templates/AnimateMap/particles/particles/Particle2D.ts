import Particle from "./Particle";

export default class Particle2D extends Particle {
  public x = 0;
  public y = 0;
  public previousX = 0;
  public previousY = 0;
  public velX = 0;
  public velY = 0;
  public rotation = 0;
  public angVelocity = 0;

  /**
   * The position in the emitter's horizontal spacial sorted array
   */
  public sortID = -1;

  private _previousMass = 0;
  private _previousRadius = 0;
  private _inertia = 0;

  /**
   * The moment of inertia of the particle about its center point
   */
  public get inertia(): number {
    if (
      this.mass !== this._previousMass ||
      this.collisionRadius !== this._previousRadius
    ) {
      this._inertia =
        this.mass * this.collisionRadius * this.collisionRadius * 0.5;
      this._previousMass = this.mass;
      this._previousRadius = this.collisionRadius;
    }
    return this._inertia;
  }
}
