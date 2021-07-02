import { Container } from "pixi.js";
import { IMapItem, MapItemDefaultProps, MapItemProps } from "./IMapItem";

export class MapItem extends Container implements IMapItem {
  protected _props: MapItemProps = MapItemDefaultProps;

  public async init(): Promise<void> {}

  public async release(): Promise<void> {
    this._props = MapItemDefaultProps;
  }

  public fillProps(props: MapItemProps): void {
    this._props = props;

    this.name = this._props.name;
    this.position.set(this._props.x, this._props.y);
    this.scale.set(this._props.scale);
  }

  public get props(): MapItemProps {
    return this._props;
  }
}
