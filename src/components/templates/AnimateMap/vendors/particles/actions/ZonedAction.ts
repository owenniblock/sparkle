/**
 * The ZonedAction Action applies an action to the particle only if it is in
 * the specified zone.
 */

import Emitter from "../emitters/Emitter";
import Particle from "../particles/Particle2D";
import { Zone2D } from "../zones/Zone2D";
import Action from "./Action";

export default class ZonedAction extends Action {
  private _action: Action;
  private _zone: Zone2D;
  private _invert: boolean;

  /**
   * The constructor creates a ZonedAction action for use by an emitter.
   * To add a ZonedAction to all particles created by an emitter, use the
   * emitter's addAction method.
   *
   * @see org.flintparticles.emitters.Emitter#addAction()
   *
   * @param action The action to apply when inside the zone.
   * @param zone The zone in which to apply the action.
   * @param invertZone If false (the default) the action is applied only to
   * particles inside the zone. If true the action is applied only to
   * particles outside the zone.
   */
  constructor(action: Action, zone: Zone2D, invertZone = false) {
    super();
    this._action = action;
    this._zone = zone;
    this._invert = invertZone;
  }

  /**
   * The action to apply when inside the zone.
   */
  public get action(): Action {
    return this._action;
  }
  public set action(value: Action) {
    this._action = value;
  }

  /**
   * The zone in which to apply the acceleration.
   */
  public get zone(): Zone2D {
    return this._zone;
  }
  public set zone(value: Zone2D) {
    this._zone = value;
  }

  /**
   * If false (the default), the action is applied only to particles inside
   * the zone. If true, the action is applied only to particles outside the zone.
   */
  public get invertZone(): boolean {
    return this._invert;
  }
  public set invertZone(value: boolean) {
    this._invert = value;
  }

  /**
   * Provides acces to the priority of the action being used.
   *
   * @see org.flintparticles.common.actions.Action#getDefaultPriority()
   */
  public get priority(): number {
    return this._action.priority;
  }
  public set priority(value: number) {
    this._action.priority = value;
  }

  /**
   * Calls the addedToEmitter method of the action being used.
   *
   * @param emitter The emitter this action has been added to.
   *
   * @see org.flintparticles.common.actions.Action#addedToEmitter()
   */
  public addedToEmitter(emitter: Emitter): void {
    this._action.addedToEmitter(emitter);
  }

  /**
   * Calls the removedFromEmitter method of the action being used.
   *
   * @param emitter The emitter this action has been added to.
   *
   * @see org.flintparticles.common.actions.Action#removedFromEmitter()
   */
  public removedFromEmitter(emitter: Emitter): void {
    this._action.removedFromEmitter(emitter);
  }

  /**
   * Checks if the particle is in the zone and if so calls the update
   * method of the action being used.
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
    if (this._zone.contains(particle.x, particle.y)) {
      if (!this._invert) {
        this._action.update(emitter, particle, time);
      }
    } else {
      if (this._invert) {
        this._action.update(emitter, particle, time);
      }
    }
  }
}
