import { ExtendedFirebaseInstance } from "react-redux-firebase";
import { IBufferingDataProvider } from "../IBufferingDataProvider";
import { FrameTickProvider } from "@ash.ts/tick";
import { FirebaseDataProvider } from "./FirebaseDataProvider";
import {
  PlayerDataProvider,
  PlayerDataProviderEvents,
} from "./PlayerDataProvider";

export interface Point {
  x: number;
  y: number;
}

const FREQUENCY_UPDATE = 0.002; //per second

/**
 * Buffering Data Provider, implementation for firestore
 */
export class BufferingDataProvider
  extends FirebaseDataProvider
  implements IBufferingDataProvider {
  private _tickProvider: FrameTickProvider;
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

    this._tickProvider = new FrameTickProvider();
    this._tickProvider.add(this._update.bind(this));
    this._tickProvider.start();
  }

  private _update(a: number) {
    this._updateCounter += a;
    if (this._updateCounter > this._maxUpdateCounter) {
      this._updateCounter -= this._maxUpdateCounter;
      this.player.updatePosition();
      this._update(0);
    }
  }

  public release() {
    this.player.release();
    this._tickProvider.stop();
    this._tickProvider.remove(this._update.bind(this));
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
  }
}
