import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import Action from "./Action";

/*
 * Для использования с ZonedAction
 */
export default class ActionCallback extends Action {
  private _callBack: Function;
  private _once: boolean;
  private _called = false;

  constructor(callBack: Function, once = false) {
    super();
    this._callBack = callBack;
    this._once = once;
  }

  public update(emitter: Emitter, particle: Particle, time: number): void {
    if (this._once && !this._called) {
      this._callBack();
    } else {
      this._callBack();
    }

    this._called = true;
  }
}
