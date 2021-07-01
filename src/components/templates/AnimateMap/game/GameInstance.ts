import {
  Application,
  Container,
  Loader,
  LoaderResource,
  Renderer,
} from "pixi.js";
import { MapContainer } from "./map/MapContainer";
import { assets } from "./constants/AssetConstants";
import GlobalStorage from "./storage/GlobalStorage";
import { stubUsersData, stubVenuesData } from "./constants/StubVenuesData";
import { IBufferingDataProvider } from "../bridges/IBufferingDataProvider";
import Movements from "./logic/Movements";

export class GameInstance {
  private _app: Application | null = null;
  private _renderer: Renderer | null = null;
  private _movements: Movements;

  private _stage: Container | null = null;
  private _mapContainer: MapContainer | null = null;

  constructor(
    private _dataProvider: IBufferingDataProvider,
    private _containerElement: HTMLDivElement
  ) {
    this._movements = new Movements();
  }

  public async init(): Promise<void> {
    // if (!this._app) //Note: broke?
    //   return Promise.reject("App already init!")

    await this.initRenderer();
    await this.loadAssets(assets);
    await this.initMap();

    this._movements.init();
    window.addEventListener("resize", this.resize);
  }

  private async initRenderer(): Promise<void> {
    this._app = new Application({
      transparent: true,
      antialias: true,
      resizeTo: this._containerElement,
      backgroundColor: 0x10bb99,
      resolution: window.devicePixelRatio,
    });

    this._renderer = this._app.renderer;
    this._stage = this._app.stage;

    this._containerElement.appendChild(this._app.view);
  }

  private async initMap(): Promise<void> {
    GlobalStorage.set("users", stubUsersData());
    GlobalStorage.set("venues", stubVenuesData());

    this._mapContainer = new MapContainer(this._app);

    await this._mapContainer.init();

    this._stage?.addChild(this._mapContainer);
  }

  private loadAssets(resources: string[]): Promise<void> {
    return new Promise((resolve) => {
      resources.forEach((url) => {
        this._app?.loader.add(url);
      });

      this._app?.loader.onLoad.add(() => {
        resolve();
      });
      this._app?.loader.onError.add(
        (loader: Loader, resource: LoaderResource) => console.error(resource)
      );

      this._app?.loader.load();
    });
  }

  public start(): void {
    if (this._app) {
      this._app.start();
      this._app.ticker.add(this.update, this);
      this.resize();

      window.addEventListener("resize", this.resize);
    }
  }

  private resize(): void {
    if (this._renderer) {
      const rect: DOMRect = this._containerElement.getBoundingClientRect();

      this._renderer.resize(rect.width, rect.height);

      if (this._mapContainer) {
        this._mapContainer.resize(rect.width, rect.height);
      }
    }
  }

  private update(dt: number): void {
    // todo: width & height change checking
    this._movements.update(dt);
  }

  /**
   * Release methods
   */
  public async release(): Promise<void> {
    await this.releaseMap();
    await this.releaseRenderer();
  }

  private async releaseRenderer(): Promise<void> {
    if (this._app) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy(false);
    }
  }

  private async releaseMap(): Promise<void> {
    if (this._mapContainer) {
      this._stage?.removeChild(this._mapContainer);

      await this._mapContainer.release();
    }
  }
}
