import Emitter from "../emitters/Emitter";
import Particle2D from "../particles/Particle2D";

export default class Action {
  protected _priority = 0;

  public get priority(): number {
    return this._priority;
  }
  public set priority(value: number) {
    this._priority = value;
  }

  public removedFromEmitter(emitter: Emitter): void {
    // console.log('action removedFromEmitter')
  }

  public addedToEmitter(emitter: Emitter): void {
    // console.log('action addedToEmitter')
  }

  public update(emitter: Emitter, particle: Particle2D, time: number): void {
    // console.log('action update')
  }
}
