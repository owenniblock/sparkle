import * as PIXI from "pixi.js";
import { MapItem } from "./MapItem";

export class MapItemSprite extends MapItem {
  protected _sprite: PIXI.Sprite | null = null;

  public async init(): Promise<void> {
    await super.init();

    this._sprite = new PIXI.Sprite();
    this._sprite.anchor.set(0.5);
    this.addChild(this._sprite);

    if (this._props.image !== null) {
      this._sprite.texture = PIXI.Texture.from(this._props.image);
    }
  }

  public async release(): Promise<void> {
    await super.release();
  }
}
