import { FirebaseDataProvider } from "./FirebaseDataProvider";
import { ExtendedFirebaseInstance } from "react-redux-firebase";
import { Point } from "./BufferingDataProvider";
import { IPlayerDataProvider } from "../IBufferingDataProvider";

const MAX_POSITION_DELTA = 50; //max distance when we need send new position to firestore
const MAX_POSITION_DELTA_SQUARE = Math.pow(MAX_POSITION_DELTA, 2); //optimization for calc
export const MAX_BASE_POINT_DELTA = 500; //max distance when we need send new position to firestore
const MAX_BASE_POINT_DELTA_SQUARE = Math.pow(MAX_BASE_POINT_DELTA, 2); //optimization for calc
export const USERS_POSITION_COLLECTION = "usersPosition";

export enum PlayerDataProviderEvents {
  BASE_POINT_CHANGED = "BASE_POINT_CHANGED",
}

export class PlayerDataProvider
  extends FirebaseDataProvider
  implements IPlayerDataProvider {
  private _firestorePosition: Point = { x: 0, y: 0 };
  private _bufferedPosition: Point = { x: 0, y: 0 };
  private _basePoint: Point = { x: 0, y: 0 };
  private _positionRef;

  private _isReady = false;

  public isReady() {
    return this._isReady;
  }

  get position() {
    return { x: this._bufferedPosition.x, y: this._bufferedPosition.y };
  }

  private _setBasePoint(x: number, y: number) {
    this._basePoint.x = x;
    this._basePoint.y = y;
    this.emit(PlayerDataProviderEvents.BASE_POINT_CHANGED, { x, y });
  }

  constructor(_firebase: ExtendedFirebaseInstance, readonly id: string) {
    super(_firebase);

    this._positionRef = this._firestore
      .collection(USERS_POSITION_COLLECTION)
      .doc(id);
  }

  public updatePosition() {
    // AB = sqrt( (Ax-Bx)^2 + (Ay-By)^2 ) - distance between points
    const AxBx = this._firestorePosition.x - this._bufferedPosition.x;
    const AyBy = this._firestorePosition.y - this._bufferedPosition.y;
    const radicandExpression = AxBx * AxBx + AyBy * AyBy;
    if (radicandExpression > MAX_POSITION_DELTA_SQUARE) this.savePosition();
    if (radicandExpression > MAX_BASE_POINT_DELTA_SQUARE)
      this._setBasePoint(this._bufferedPosition.x, this._bufferedPosition.y);
  }

  public async savePosition() {
    if (!this.id) return Promise.reject("Unexpected player id");

    return this._positionRef.set({ ...this._bufferedPosition }).then(() => {
      this._firestorePosition.x = this._bufferedPosition.x;
      this._firestorePosition.y = this._bufferedPosition.y;
    });
  }

  public async loadPosition() {
    if (!this.id) return Promise.reject("Unexpected player id");

    return this._positionRef.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data() as Point;
        this._bufferedPosition.x = this._firestorePosition.x = data.x;
        this._bufferedPosition.y = this._firestorePosition.y = data.y;
        this._setBasePoint(data.x, data.y);
        return Promise.resolve(this._firestorePosition);
      } else return Promise.reject("Player not exists");
    });
  }

  public setPosition(x: number, y: number) {
    if (!this._isReady) return;

    this._bufferedPosition.x = x;
    this._bufferedPosition.y = y;
  }

  public async initPositionAsync(x: number, y: number) {
    if (this._isReady) return Promise.reject("Player already init!");

    return this.loadPosition()
      .then(() => (this._isReady = true))
      .catch(() => {
        this.setPosition(x, y);
        this._setBasePoint(x, y);
        return this.savePosition().then(() => {
          this._isReady = true;
        });
      });
  }

  public release() {
    this.savePosition().catch((error) => console.error(error));
  }
}
