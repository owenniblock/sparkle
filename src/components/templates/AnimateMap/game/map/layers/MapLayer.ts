import * as PIXI from "pixi.js";
import GlobalStorage, {
  ReplicatedUser,
  ReplicatedVenue,
} from "../../storage/GlobalStorage";
import TickProvider from "../../utils/TickProvider";
import {
  getUsersForRender,
  getVenuesForRender,
} from "../items/GetItemsForRender";

export interface LayerProps {
  layer: number;
}

export class MapLayer extends PIXI.Container {
  constructor(private _props: LayerProps | null) {
    super();
  }

  public init(): void {
    GlobalStorage.on("change:zoom", this._onUpdate, this);
    GlobalStorage.on("change:cameraRect", this._onUpdate, this);
    GlobalStorage.on("change:usersQT", this._onUpdate, this);
    GlobalStorage.on("change:venuesQT", this._onUpdate, this);
    new TickProvider(this._onUsersAnimate).start();
  }

  protected _onUsersAnimate = (time: number): void => {
    const layer = this._props?.layer;

    const zoom = GlobalStorage.get("zoom");
    const cameraRect = GlobalStorage.get("cameraRect");

    const usersQT = GlobalStorage.get("usersQT");

    const isVisible = zoom === layer;

    const usersForRender: ReplicatedUser[] = usersQT?.query(cameraRect);

    if (isVisible) {
      usersForRender.forEach((o) => {
        const displayObject:
          | PIXI.DisplayObject
          | undefined = this.getChildByName(o.data.id);
        if (displayObject) {
          displayObject.x = o.x;
          displayObject.y = o.y;
        }
      });
    }
  };

  // TODO: split to small functions with update checking
  protected _onUpdate(): void {
    const layer = this._props?.layer;

    // const zoom = GlobalStorage.get("zoom");
    const cameraRect = GlobalStorage.get("cameraRect");

    const usersQT = GlobalStorage.get("usersQT");
    const venuesQT = GlobalStorage.get("venuesQT");

    // const isVisible = zoom === layer;
    const isVisible = true;

    const users = usersQT?.query(cameraRect);
    const venues = venuesQT?.query(cameraRect);

    const usersForRender = getUsersForRender(layer, users as ReplicatedUser[]);
    const venuesForRender = getVenuesForRender(
      layer,
      venues as ReplicatedVenue[]
    );

    this.clearAll();

    if (isVisible) {
      usersForRender.forEach((o) => {
        o.init();
        this.addChild(o);
      });
      venuesForRender.forEach((o) => {
        o.init();
        this.addChild(o);
      });
    }
  }

  protected clearAll(): void {
    while (this.children.length) {
      this.removeChildAt(0);
    }
  }

  public release(): void {}
}
