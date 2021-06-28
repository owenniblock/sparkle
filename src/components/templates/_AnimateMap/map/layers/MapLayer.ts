import * as PIXI from "pixi.js";
import { ReplicatedUser, ReplicatedVenue } from "store/reducers/AnimateMap";
import GlobalStorage from "../../storage/GlobalStorage";
import {
  getUsersForRender,
  getVenuesForRender,
} from "../items/GetItemsForRender";

export interface LayerProps {
  layer: number;
}

export class MapLayer extends PIXI.Container {
  protected _onUpdateBind: () => void = () => {};
  protected _props: LayerProps | null = null;

  constructor(props: LayerProps) {
    super();

    this._props = props;
  }

  public init(): void {
    this._onUpdateBind = this._onUpdate.bind(this);

    GlobalStorage.on("change:zoom", () => this._onUpdateBind());
    GlobalStorage.on("change:cameraRect", () => this._onUpdateBind());
    GlobalStorage.on("change:usersQT", () => this._onUpdateBind());
    GlobalStorage.on("change:venuesQT", () => this._onUpdateBind());
  }

  public release(): void {}

  // TODO: split to small functions with update checking
  protected _onUpdate(): void {
    const layer = this._props?.layer;

    const zoom = GlobalStorage.get("zoom");
    const cameraRect = GlobalStorage.get("cameraRect");

    const usersQT = GlobalStorage.get("usersQT");
    const venuesQT = GlobalStorage.get("venuesQT");

    const isVisible = zoom === layer;

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
}
