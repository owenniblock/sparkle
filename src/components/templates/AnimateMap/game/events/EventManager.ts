import { BufferingDataProviderEvents } from "../../bridges/DataProvider/BufferingDataProvider";
import { EventType, EventUpdatePlayerPositionProps } from "./EventType";
import { IBufferingDataProvider } from "../../bridges/IBufferingDataProvider";
import { utils } from "pixi.js";

class _EventManager extends utils.EventEmitter {
  private _dataProvider: IBufferingDataProvider | null = null;

  public setDataProvider(dataProvider: IBufferingDataProvider): void {
    if (!dataProvider) {
      return;
    }

    this._dataProvider = dataProvider;

    this._dataProvider.on(
      BufferingDataProviderEvents.PLAYER_BASE_POINT_CHANGED,
      this._onPlayerBasePointChanged
    );
  }

  private _onPlayerBasePointChanged({ x, y }: { x: number; y: number }) {
    this.emit(EventType.UPDATE_PLAYER_POSITION, {
      x,
      y,
    } as EventUpdatePlayerPositionProps);
  }
}

const EventManager = new _EventManager();
export default EventManager;
