import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import Action from "./Action";

export default class Move extends Action {
  constructor() {
    super();
    this.priority = -10;
  }

  /**
   * Updates the particle's position based on its velocity and the period of
   * time indicated.
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
    particle.previousX = particle.x;
    particle.previousY = particle.y;
    particle.x += particle.velX * time;
    particle.y += particle.velY * time;
  }
}
