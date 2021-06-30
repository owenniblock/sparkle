import Particle2D from "../../particles/particles/Particle2D";
import { ReplicatedUser } from "../storage/GlobalStorage";

export default class CustomParticle extends Particle2D {
  constructor(public user: ReplicatedUser) {
    super();
  }
}
