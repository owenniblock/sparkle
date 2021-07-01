import Action from "../../vendors/particles/actions/Action";
import Emitter from "../../vendors/particles/emitters/Emitter";
import Particle2D from "../../vendors/particles/particles/Particle2D";
import CustomParticle from "./CustomParticle";

export default class UpdateUserPositionAction extends Action {
  public update(emitter: Emitter, particle: Particle2D, time: number): void {
    // console.log('action update')
    (particle as CustomParticle).user.x = particle.x;
    (particle as CustomParticle).user.y = particle.y;
  }
}
