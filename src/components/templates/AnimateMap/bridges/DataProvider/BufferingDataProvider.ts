import { ExtendedFirebaseInstance } from "react-redux-firebase";
import { IBufferingDataProvider } from "../IBufferingDataProvider";
import { FirebaseDataProvider } from "./FirebaseDataProvider";
import {
  PlayerDataProvider,
  PlayerDataProviderEvents,
} from "./PlayerDataProvider";

export interface Point {
  x: number;
  y: number;
}

export enum BufferingDataProviderEvents {
  PLAYER_BASE_POINT_CHANGED = "BufferingDataProviderEvents.PLAYER_BASE_POINT_CHANGED",
}

const FREQUENCY_UPDATE = 0.002; //per second

/**
 * Buffering Data Provider, implementation for firestore
 */
export class BufferingDataProvider
  extends FirebaseDataProvider
  implements IBufferingDataProvider {
  private _updateCounter = 0;
  private _maxUpdateCounter = 1 / FREQUENCY_UPDATE;
  readonly player: PlayerDataProvider;

  /**
   * Update frequency (per second)
   */
  private _frequencyUpdate = FREQUENCY_UPDATE;
  get frequencyUpdate() {
    return this._frequencyUpdate;
  }

  set frequencyUpdate(value) {
    this._frequencyUpdate = value;
    this._maxUpdateCounter = 1 / value;
  }

  constructor(firebase: ExtendedFirebaseInstance, readonly playerId?: string) {
    super(firebase);

    this.player = new PlayerDataProvider(firebase, playerId);
    this.player.on(
      PlayerDataProviderEvents.BASE_POINT_CHANGED,
      this._basePointChangeHandler,
      this
    );
  }

  public update(dt: number) {
    this._updateCounter += dt;
    if (this._updateCounter > this._maxUpdateCounter) {
      this._updateCounter -= this._maxUpdateCounter;
      this.player.updatePosition();
      this.update(0);
    }
  }

  public release() {
    this.player.release();
  }

  // player provider
  public initPlayerPositionAsync(x: number, y: number) {
    return this.player.initPositionAsync(x, y);
  }

  public setPlayerPosition(x: number, y: number) {
    this.player.setPosition(x, y);
  }

  private _basePointChangeHandler(args: null) {
    console.log("base Point changed");
    console.log(args);

    this.emit(BufferingDataProviderEvents.PLAYER_BASE_POINT_CHANGED, args);
  }
}
