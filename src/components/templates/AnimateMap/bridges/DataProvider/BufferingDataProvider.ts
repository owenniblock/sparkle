import { ExtendedFirebaseInstance } from "react-redux-firebase";
import { IBufferingDataProvider } from "../IBufferingDataProvider";
import { FirebaseDataProvider } from "./FirebaseDataProvider";
import {
  PlayerDataProvider,
  PlayerDataProviderEvents,
  USERS_POSITION_COLLECTION,
} from "./PlayerDataProvider";
import { firestore } from "firebase/app";

export interface Point {
  x: number;
  y: number;
}

export enum BufferingDataProviderEvents {
  PLAYER_BASE_POINT_CHANGED = "BufferingDataProviderEvents.PLAYER_BASE_POINT_CHANGED",
  USERS_POSITION_UPDATE = "BufferingDataProviderEvents.REPLICATED_USERS_UPDATE",
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

  private _usersPositionRef;
  private _usersPositionUnsubscribe = () => {};

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

  constructor(firebase: ExtendedFirebaseInstance, readonly playerId: string) {
    super(firebase);

    this._usersPositionRef = this._firestore.collection(
      USERS_POSITION_COLLECTION
    );

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
  public async initPlayerPositionAsync(x: number, y: number) {
    return this.player.initPositionAsync(x, y);
  }

  public setPlayerPosition(x: number, y: number) {
    this.player.setPosition(x, y);
  }

  private _basePointChangeHandler(basePoint: Point) {
    console.log("base Point changed");
    console.log(basePoint);
    this.emit(BufferingDataProviderEvents.PLAYER_BASE_POINT_CHANGED, basePoint);
    this._subscribeToBasePointRectangle(basePoint);
  }

  private _subscribeToBasePointRectangle(basePoint: Point) {
    this._usersPositionUnsubscribe();

    //NOTE: https://firebase.google.com/docs/firestore/query-data/queries#compound_queries
    // first option: add new array-field "areas" and get all users when have current area id
    // client must save inside own "areas" field all nearest area and own area too

    // const distance = 100;
    // const xLowerBound = basePoint.x - distance;
    // const xUpperBound = basePoint.x + distance;
    // const yLowerBound = basePoint.y - distance;
    // const yUpperBound = basePoint.y + distance;

    this._usersPositionUnsubscribe = this._usersPositionRef
      // .where("x", ">=", xLowerBound)
      // .where("y", ">=", yLowerBound)
      // .where("x", "<=", xUpperBound)
      // .where("y", "<=", yUpperBound)
      // .limit(MAX_USERS)
      .onSnapshot(this._onSnapshotHandler.bind(this));
  }

  private _onSnapshotHandler(
    querySnapshot: firestore.QuerySnapshot<firestore.DocumentData>
  ) {
    let usersPosition: Array<{ id: string; x: number; y: number }> = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      usersPosition.push({ id: doc.id, x: data.x, y: data.y });
    });
    console.log(usersPosition);
    this.emit(BufferingDataProviderEvents.USERS_POSITION_UPDATE, usersPosition);
  }
}
