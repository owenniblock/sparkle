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
import { IBufferingDataProvider } from "../DataProvider/IBufferingDataProvider";
import { Store } from "redux";
import Movements from "./logic/Movements";

export class GameInstance {
  // private _containerElement: HTMLDivElement | null = null;
  private _app: Application | null = null;
  private _renderer: Renderer | null = null;

  private _stage: Container | null = null;
  private _mapContainer: MapContainer | null = null;

  constructor(
    private _dataProvider: IBufferingDataProvider,
    private _containerElement: HTMLDivElement,
    private _store: Store
  ) {}

  public async init(): Promise<void> {
    await this.initRenderer();
    await this.loadAssets(assets);
    await this.initMap();

    new Movements().init();
  }

  public async release(): Promise<void> {
    await this.releaseMap();
    await this.releaseRenderer();
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

  private async releaseRenderer(): Promise<void> {
    if (this._app) {
      this._app.ticker.remove(this.update, this);
      this._app.destroy(false);
    }
  }

  private async initMap(): Promise<void> {
    GlobalStorage.set("users", stubUsersData());
    GlobalStorage.set("venues", stubVenuesData());

    this._mapContainer = new MapContainer(this._app);

    await this._mapContainer.init();

    this._stage?.addChild(this._mapContainer);
  }

  private async releaseMap(): Promise<void> {
    if (this._mapContainer) {
      this._stage?.removeChild(this._mapContainer);

      await this._mapContainer.release();
    }
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
    }
  }

  private resize(): void {
    if (this._renderer) {
      const w = this._renderer.width;
      const h = this._renderer.height;

      if (this._mapContainer) {
        this._mapContainer.resize(w, h);
      }
    }
  }

  private update(dt: number): void {
    // todo: width & height change checking
    this.resize();
  }
}
