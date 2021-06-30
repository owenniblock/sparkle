import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import { Zone2D } from "../zones/Zone2D";
import Action from "./Action";

export default class DeathZone extends Action {
  private _zone: Zone2D | null = null;
  private _invertZone = false;

  /**
   * The constructor creates a DeathZone action for use by an emitter.
   * To add a DeathZone to all particles created by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.common.emitters.Emitter#addAction()
   * @see org.flintparticles.twoD.zones
   *
   * @param zone The zone to use. Any item from the
   * org.flintparticles.twoD.zones package can be used.
   * @param zoneIsSafe If true, the zone is treated as the safe area
   * and particles outside the zone are killed. If false, particles
   * inside the zone are killed.
   */
  constructor(zone: Zone2D, zoneIsSafe = false) {
    super();
    this.priority = -20;
    this.zone = zone;
    this.zoneIsSafe = zoneIsSafe;
  }

  /**
   * The zone.
   */
  public get zone(): Zone2D {
    return this._zone!;
  }
  public set zone(value: Zone2D) {
    this._zone = value;
  }

  /**
   * If true, the zone is treated as the safe area and particles ouside the
   * zone are killed. If false, particles inside the zone are killed.
   */
  public get zoneIsSafe(): boolean {
    return this._invertZone;
  }
  public set zoneIsSafe(value: boolean) {
    this._invertZone = value;
  }

  /**
   * Checks whether the particle is inside the zone and kills it if it is
   * in the DeathZone region.
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
    const inside = this._zone!.contains(particle.x, particle.y);
    if (this._invertZone) {
      if (!inside) {
        particle.isDead = true;
      }
    } else {
      if (inside) {
        particle.isDead = true;
      }
    }
  }
}
