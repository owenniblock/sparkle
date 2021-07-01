import * as PIXI from "pixi.js";
import { MovedEventData, Viewport, ZoomedEventData } from "pixi-viewport";
import GlobalStorage from "../storage/GlobalStorage";
import { Box } from "js-quadtree";
import { MapItemContainer } from "./MapItemContainer";
import { MAP_IMAGE } from "../constants/AssetConstants";
import EventManager from "../events/EventManager";
import {
  EventType,
  EventUpdateCameraRectProps,
  EventUpdateCameraZoomProps,
} from "../events/EventType";

export class MapContainer extends PIXI.Container {
  private _background: PIXI.Sprite | null = null;
  private _itemContainer: MapItemContainer | null = null;

  private _viewport: Viewport | null = null;
  private _viewportRectMultiplier: number = 1.2;

  constructor(private _app: PIXI.Application | null) {
    super();
  }

  public async init(): Promise<void> {
    this.initViewport();
    this.initBackground();
    this.initEntities();
  }

  private initViewport(): void {
    const worldWidth = GlobalStorage.get("worldWidth");
    const worldHeight = GlobalStorage.get("worldHeight");

    this._viewport = new Viewport({
      worldWidth: worldWidth,
      worldHeight: worldHeight,
      interaction: this._app?.renderer.plugins.interaction,
    })
      .drag({ factor: 0.9 })
      .pinch()
      .wheel({ percent: 0.5, smooth: 10 })
      .decelerate()
      .clamp({
        left: true,
        right: true,
        top: true,
        bottom: true,
      })
      .clampZoom({
        maxWidth: worldWidth,
        maxHeight: worldHeight,
      });

    this._viewport.moveCenter(worldWidth / 2, worldHeight / 2);
    this._viewport.on("moved", this._onViewportMoved, this);
    this._viewport.on("zoomed", this._onViewportZoomed, this);

    this.addChild(this._viewport);
  }

  private _onViewportMoved(data: MovedEventData): void {
    const view = data.viewport.lastViewport;
    const x = -view?.x / view?.scaleX;
    const y = -view?.y / view?.scaleY;
    const width = data.viewport.screenWidth / view?.scaleX;
    const height = data.viewport.screenHeight / view?.scaleY;

    const rect = new Box(
      x + (width - width * this._viewportRectMultiplier) / 2,
      y + (height - height * this._viewportRectMultiplier) / 2,
      width * this._viewportRectMultiplier,
      height * this._viewportRectMultiplier
    );

    GlobalStorage.set("cameraRect", rect);

    EventManager.emit(
      EventType.UPDATE_CAMERA_RECT,
      <EventUpdateCameraRectProps>rect
    );
  }

  private _onViewportZoomed(data: ZoomedEventData): void {
    let layer = GlobalStorage.get("layer");
    let value = 0;

    if (data.viewport.lastViewport.scaleY > 0.6 && layer !== 0) {
      value = 0;
    } else if (data.viewport.lastViewport.scaleY < 0.2 && layer !== 2) {
      value = 2;
    } else if (layer !== 1) {
      value = 1;
    }

    GlobalStorage.set("zoom", value);

    EventManager.emit(
      EventType.UPDATE_CAMERA_ZOOM,
      <EventUpdateCameraZoomProps>value
    );
  }

  private initBackground(): void {
    this._background = PIXI.Sprite.from(MAP_IMAGE);
    this._viewport?.addChild(this._background);
  }

  private initEntities(): void {
    this._itemContainer = new MapItemContainer();
    this._viewport?.addChild(this._itemContainer);
  }

  public resize(width: number, height: number): void {
    if (this._viewport) {
      this._viewport.resize(width, height);
    }
  }

  public async release(): Promise<void> {
    this.releaseBackground();
    this.releaseViewport();
  }

  private releaseBackground(): void {
    if (this._viewport && this._background) {
      this._viewport.off("moved", this._onViewportMoved, this);
      this._viewport.off("zoomed", this._onViewportZoomed, this);

      this._viewport.removeChild(this._background);
      this._background = null;
    }
  }

  private releaseViewport(): void {
    if (this._viewport) {
      this.removeChild(this._viewport);
      this._viewport = null;
    }
  }

  public update(dt: number): void {
    this._itemContainer?.update(dt);
  }
}
