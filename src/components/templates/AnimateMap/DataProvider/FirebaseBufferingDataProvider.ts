import {
  ExtendedFirebaseInstance,
  ExtendedFirestoreInstance,
} from "react-redux-firebase";
import { IBufferingDataProvider } from "./IBufferingDataProvider";
import { FrameTickProvider } from "@ash.ts/tick";

interface Point {
  x: number;
  y: number;
}

const MAX_POSITION_DELTA = 50;
const MAX_POSITION_DELTA_SQUARE = Math.pow(MAX_POSITION_DELTA, 2);

/**
 * Buffering Data Provider
 */
export class FirebaseBufferingDataProvider implements IBufferingDataProvider {
  private _tickProvider: FrameTickProvider;
  private _updateCounter = 0;
  private _maxUpdateCounter = 1;
  private _firestore: ExtendedFirestoreInstance;

  /**
   * frequency update per second
   */
  private _frequencyUpdate = 0.2;
  get frequencyUpdate() {
    return this._frequencyUpdate;
  }

  set frequencyUpdate(value) {
    this._frequencyUpdate = value;
    this._maxUpdateCounter = 1 / value;
  }

  constructor(
    private _firebase: ExtendedFirebaseInstance,
    private _playerId?: string
  ) {
    this._firestore = _firebase.firestore();
    this._playerPositionRef = this._firestore
      .collection("usersPosition")
      .doc(_playerId);

    this._loadPlayerPosition()
      .then(() => (this._playerIsReady = true))
      .catch((error) => {
        console.error(error);
        // this.initPlayerPositionAsync(500,500)
        //   .then(()=> {
        //     console.log(this);
        //     debugger
        //   })
      });

    this._tickProvider = new FrameTickProvider();
    this._tickProvider.add(this._update.bind(this));
    this._tickProvider.start();
  }

  private _release() {
    this._savePlayerPosition().catch((error) => console.error(error));

    this._tickProvider.stop();
    this._tickProvider.remove(this._update.bind(this));
  }

  private _update(a: number) {
    this._updateCounter += a;
    if (this._updateCounter > this._maxUpdateCounter) {
      this._updateCounter -= this._maxUpdateCounter;
      this._updatePlayerDecisionTree();
      this._update(0);
    }
  }

  // Player Position

  private _playerIsReady = false;

  public isPlayerReady() {
    return this._playerIsReady;
  }

  private _playerPositionRef;
  private _playerFirestorePosition: Point = { x: 0, y: 0 };
  private _playerBufferedPosition: Point = { x: 0, y: 0 };

  private _updatePlayerDecisionTree() {
    const radicandDistance = //
      Math.pow(
        this._playerFirestorePosition.x - this._playerFirestorePosition.y,
        2
      ) +
      Math.pow(
        this._playerBufferedPosition.x - this._playerBufferedPosition.y,
        2
      );
    if (radicandDistance > MAX_POSITION_DELTA_SQUARE) {
      //the user has moved to the maximum distance
      this._savePlayerPosition();
    }
  }

  private async _savePlayerPosition() {
    if (!this._playerId) return Promise.reject("Unexpected player id");

    return this._playerPositionRef
      .set({ ...this._playerBufferedPosition })
      .then(() => {
        this._playerFirestorePosition.x = this._playerBufferedPosition.x;
        this._playerFirestorePosition.y = this._playerBufferedPosition.y;
      });
  }

  private async _loadPlayerPosition() {
    if (!this._playerId) return Promise.reject("Unexpected player id");

    return this._playerPositionRef.get().then((doc) => {
      console.log("get doc");
      if (doc.exists) {
        const data = doc.data() as Point;
        this._playerFirestorePosition.x = data.x;
        this._playerFirestorePosition.y = data.y;
        return Promise.resolve(data);
      } else return Promise.reject("player not exists");
    });
  }

  public setPlayerPosition(x: number, y: number) {
    this._playerBufferedPosition.x = x;
    this._playerBufferedPosition.y = y;
  }

  public async initPlayerPositionAsync(x: number, y: number) {
    if (this._playerIsReady) return Promise.reject("Player already init!");

    this.setPlayerPosition(x, y);
    return this._savePlayerPosition().then(() => {
      this._playerIsReady = true;
    });
  }
}
