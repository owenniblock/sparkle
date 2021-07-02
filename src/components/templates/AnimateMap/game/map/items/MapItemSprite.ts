import { Sprite, Texture } from "pixi.js";
import { MapItem } from "./MapItem";
import { MapItemProps } from "./IMapItem";

export class MapItemSprite extends MapItem {
  protected _sprite: Sprite | null = null;

  public async init(): Promise<void> {
    this._sprite = new Sprite();
    this._sprite.anchor.set(0.5, 0);
    this._sprite.scale.set(0.2);
    this.addChild(this._sprite);
  }

  public async release(): Promise<void> {
    if (this._sprite) {
      this.removeChild(this._sprite);
      this._sprite = null;
    }

    await super.release();
  }

  public fillProps(props: MapItemProps): void {
    super.fillProps(props);

    if (this._props.image !== null) {
      if (this._sprite) {
        this._sprite.texture = Texture.from(this._props.image);
      }
    }
  }
}
