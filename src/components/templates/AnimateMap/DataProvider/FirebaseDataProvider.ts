import { ExtendedFirebaseInstance } from "react-redux-firebase";
import { IDataProvider } from "./IDataProvider";

export class FirebaseDataProvider implements IDataProvider {
  constructor(private _firebase: ExtendedFirebaseInstance) {}

  private _someData = 0;
  get someData() {
    return this._someData;
  }
}
