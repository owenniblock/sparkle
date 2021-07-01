import * as PIXI from "pixi.js";
import { MovedEventData, Viewport, ZoomedEventData } from "pixi-viewport";
import GlobalStorage, {
  ReplicatedUser,
  ReplicatedVenue,
} from "../storage/GlobalStorage";
import { Box, QuadTree } from "js-quadtree";
import { MapLayer } from "./layers/MapLayer";
import { MAP_IMAGE } from "../constants/AssetConstants";

export enum MapLayerType {
  users = "usersQT",
  venues = "venuesQT",
}

export class MapContainer extends PIXI.Container {
  private _background: PIXI.Sprite | null = null;
  private _layerContainer: PIXI.Container | null = null;

  private _viewport: Viewport | null = null;
  private _viewportRectMultiplier: number = 1.2;

  private _quadTreeMap: Map<MapLayerType, QuadTree> = new Map();
  private _layerMap: Map<MapLayerType, MapLayer> = new Map();

  constructor(private _app: PIXI.Application | null) {
    super();
  }

  public async init(): Promise<void> {
    this.initViewport();
    this.initBackground();
    this.initLayers();

    this.generateNewQuadTree(MapLayerType.users, GlobalStorage.get("users"));
    this.generateNewQuadTree(MapLayerType.venues, GlobalStorage.get("venues"));
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

    GlobalStorage.set(
      "cameraRect",
      new Box(
        x + (width - width * this._viewportRectMultiplier) / 2,
        y + (height - height * this._viewportRectMultiplier) / 2,
        width * this._viewportRectMultiplier,
        height * this._viewportRectMultiplier
      )
    );
  }

  private _onViewportZoomed(data: ZoomedEventData): void {
    const layer = GlobalStorage.get("layer");

    if (data.viewport.lastViewport.scaleY > 0.6 && layer !== 0) {
      GlobalStorage.set("zoom", 0);
    } else if (data.viewport.lastViewport.scaleY < 0.2 && layer !== 2) {
      GlobalStorage.set("zoom", 2);
    } else if (layer !== 1) {
      GlobalStorage.set("zoom", 1);
    }
  }

  private initBackground(): void {
    this._background = PIXI.Sprite.from(MAP_IMAGE);
    this._viewport?.addChild(this._background);
  }

  private initLayers(): void {
    this._layerContainer = new PIXI.Container();
    this._viewport?.addChild(this._layerContainer);

    Object.keys(MapLayerType).forEach((key, index) => {
      const layer = new MapLayer({ layer: index });
      layer.init();

      this._layerContainer?.addChild(layer);

      this._layerMap.set(
        Object.values(MapLayerType)[index] as MapLayerType,
        layer
      );
    });
  }

  private generateNewQuadTree(
    type: MapLayerType,
    items: Map<string, ReplicatedVenue | ReplicatedUser>
  ): void {
    let quadTree = this._quadTreeMap.get(type);

    if (!quadTree) {
      this._quadTreeMap.set(
        type,
        new QuadTree(
          new Box(
            0,
            0,
            GlobalStorage.get("worldWidth"),
            GlobalStorage.get("worldHeight")
          ),
          { maximumDepth: 100 },
          Array.from(items).map(([key, value]) => value)
        )
      );
    } else {
      quadTree.clear();
      quadTree.insert(Array.from(items).map(([key, value]) => value));
    }

    quadTree = this._quadTreeMap.get(type);

    GlobalStorage.set(type, quadTree);
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
      this._viewport.removeChild(this._background);
      this._background = null;
    }
  }

  private releaseViewport(): void {
    // TODO:
  }
}
