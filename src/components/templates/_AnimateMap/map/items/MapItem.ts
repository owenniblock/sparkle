import * as PIXI from "pixi.js";
import { IMapItem, MapItemProps } from "./IMapItem";

export class MapItem extends PIXI.Container implements IMapItem {
  protected _props: MapItemProps = {
    name: Math.random().toString(),
    x: 0,
    y: 0,
    scale: 1,
    image: null,
  };

  constructor(props: MapItemProps) {
    super();

    this._props = props;
  }

  public async init(): Promise<void> {
    this.name = this._props.name;

    this.position.set(this._props.x, this._props.y);
    this.scale.set(this._props.scale);
  }

  public async release(): Promise<void> {}
}
