import Emitter from "../emitters/Emitter";
import ParticleEvents from "../events/ParticleEvents";
import Particle from "../particles/Particle2D";
import { Zone2D } from "../zones/Zone2D";
import Action from "./Action";

export default class CollisionZone extends Action {
  private _bounce: number;
  private _zone: Zone2D;

  /**
   * The constructor creates a CollisionZone action for use by  an emitter.
   * To add a CollisionZone to all particles managed by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.common.emitters.Emitter#addAction()
   *
   * @param zone The zone that the particles should collide with.
   * @param bounce The coefficient of restitution when the particles collide.
   * A value of 1 gives a pure elastic collision, with no energy loss. A
   * value between 0 and 1 causes the particles to loose enegy in the
   * collision. A value greater than 1 causes the particle to gain energy
   * in the collision.
   */
  constructor(zone: Zone2D, bounce = 1) {
    super();
    this.priority = -30;
    this._bounce = bounce;
    this._zone = zone;
  }

  /**
   * The zone that the particles should collide with.
   */
  public get zone(): Zone2D {
    return this._zone;
  }
  public set zone(value: Zone2D) {
    this._zone = value;
  }

  /**
   * The coefficient of restitution when the particles collide. A value of
   * 1 gives a pure elastic collision, with no energy loss. A value
   * between 0 and 1 causes the particles to loose enegy in the collision.
   * A value greater than 1 causes the particles to gain energy in the collision.
   */
  public get bounce(): number {
    return this._bounce;
  }
  public set bounce(value: number) {
    this._bounce = value;
  }

  /**
   * Checks for collisions between the particle and the zone.
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
    const collide = this._zone.collideParticle(particle, this._bounce);
    if (collide && emitter.hasEventListener(ParticleEvents.ZONE_COLLISION)) {
      const options = {
        detail: {
          particle: particle,
          action: this,
        },
      };
      emitter.dispatchEvent(
        new CustomEvent(ParticleEvents.ZONE_COLLISION, options)
      );
    }
  }
}
