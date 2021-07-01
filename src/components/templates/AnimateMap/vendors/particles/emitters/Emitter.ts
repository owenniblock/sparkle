/*
 * FLINT PARTICLE SYSTEM
 * .....................
 *
 * Author: Richard Lord
 * Copyright (c) Richard Lord 2008-2011
 * http://flintparticles.org
 *
 */

import Action from "../actions/Action";
import Counter from "../counters/Counter";
import ZeroCounter from "../counters/ZeroCounter";
import Particle2D from "../particles/Particle2D";

export default class Emitter {
  protected _counter: Counter = new ZeroCounter();
  protected _actions: Array<Action> = [];
  protected _particles: Array<Particle2D> = [];

  protected _maximumFrameTime = 0.1;

  protected _running = false;

  private _eventTypes: { [key: string]: number } = {};
  private _eventDispatcher: HTMLElement;

  constructor() {
    this._eventDispatcher = document.createElement("div");
  }

  public addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject
  ): void {
    this._eventTypes[type] = this._eventTypes[type]
      ? this._eventTypes[type] + 1
      : 1;
    this._eventDispatcher.addEventListener(type, callback);
  }

  public removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject
  ): void {
    this._eventTypes[type] =
      this._eventTypes[type] && this._eventTypes[type] > 1
        ? this._eventTypes[type] - 1
        : 0;
    this._eventDispatcher.removeEventListener(type, callback);
  }

  public hasEventListener(type: string): boolean {
    return !!this._eventTypes[type];
  }

  public dispatchEvent(event: CustomEvent): void {
    this._eventDispatcher.dispatchEvent(event);
  }

  public get counter(): Counter {
    return this._counter;
  }
  public set counter(value: Counter) {
    this._counter = value;
    if (this._running) {
      this._counter.startEmitter(this);
    }
  }

  public get actions(): Array<Action> {
    return this._actions;
  }
  public set actions(value: Array<Action>) {
    while (this._actions.length) {
      this._actions.pop()?.removedFromEmitter(this);
    }

    this._actions = value.slice();
    this._actions.sort(this.prioritySort);

    this._actions.forEach((action: Action) => {
      action.addedToEmitter(this);
    });
  }

  public addAction(action: Action): void {
    const len = this._actions.length;
    let i = 0;
    for (i = 0; i < len; ++i) {
      if (this._actions[i].priority < action.priority) {
        break;
      }
    }
    this._actions.splice(i, 0, action);
    action.addedToEmitter(this);
  }

  /**
   * Removes an Action from the Emitter.
   *
   * @param action The Action to remove
   *
   * @see addAction()
   */
  public removeAction(action: Action): void {
    const index = this._actions.indexOf(action);
    if (index !== -1) {
      this._actions.splice(index, 1);
      action.removedFromEmitter(this);
    }
  }

  /**
   * Detects if the emitter is using a particular action or not.
   *
   * @param action The action to look for.
   *
   * @return true if the action is being used by the emitter, false
   * otherwise.
   */
  public hasAction(action: Action): boolean {
    return this._actions.indexOf(action) !== -1;
  }

  public get particles(): Array<Particle2D> {
    return this._particles;
  }

  public set particles(value: Array<Particle2D>) {
    this.killAllParticles();
    this.addParticles(value);
  }

  public addParticle(particle: Particle2D): void {
    this._particles.push(particle);
  }

  public addParticles(particles: Array<Particle2D>): void {
    this._particles.splice(this._particles.length, 0, ...particles);
  }

  public removeParticle(particle: Particle2D): boolean {
    const index = this._particles.indexOf(particle);
    if (index !== -1) {
      this._particles.splice(index, 1);
      return true;
    }
    return false;
  }

  public removeParticles(particles: Array<Particle2D>): void {
    for (let i = 0; i < particles.length; i++) {
      this.removeParticle(particles[i]);
    }
  }

  public killAllParticles(): void {
    this._particles.splice(0);
  }

  private prioritySort(b1: Action, b2: Action): number {
    return b1.priority - b2.priority;
  }

  public update(time: number): void {
    if (time > this._maximumFrameTime) {
      time = this._maximumFrameTime;
    }

    // sortParticle2Ds();

    if (this._particles.length === 0) {
      return;
    }

    // update particle state
    for (let j = 0; j < this._actions.length; j++) {
      for (let i = 0; i < this._particles.length; i++) {
        this._actions[j].update(this, this._particles[i], time);
      }
    }

    // remove dead particles
    const length = this._particles.length;
    for (let i = length; i--; ) {
      const particle: Particle2D = this._particles[i];
      if (particle.isDead) {
        this._particles.splice(i, 1);
      }
    }
  }
}
