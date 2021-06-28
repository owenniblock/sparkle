import * as PIXI from "pixi.js";
import React, { useEffect, useRef, useState } from "react";
import { AnimateMapProps } from "../AnimateMap/AnimateMap";
import { MapContainer } from "./map/MapContainer";
import { assets } from "./constants/AssetConstants";

import "./AnimateMap.scss";
import { stubUsersData, stubVenuesData } from "./constants/StubVenuesData";
import GlobalStorage from "./storage/GlobalStorage";

class Application {
  private _containerElement: HTMLDivElement | null = null;
  private _app: PIXI.Application | null = null;
  private _renderer: PIXI.Renderer | null = null;

  private _stage: PIXI.Container | null = null;
  private _mapContainer: MapContainer | null = null;

  public async init(containerElement: HTMLDivElement): Promise<void> {
    await this.initRenderer(containerElement);
    await this.loadAssets(assets);
    await this.initMap();
  }

  public async release(): Promise<void> {
    await this.releaseMap();
    await this.releaseRenderer();
  }

  private async initRenderer(containerElement: HTMLDivElement): Promise<void> {
    this._containerElement = containerElement;

    this._app = new PIXI.Application({
      transparent: true,
      antialias: true,
      resizeTo: containerElement,
      backgroundColor: 0x10bb99,
      resolution: window.devicePixelRatio,
    });

    this._renderer = this._app.renderer;
    this._stage = this._app.stage;

    containerElement.appendChild(this._app.view);
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
        (loader: PIXI.Loader, resource: PIXI.LoaderResource) =>
          console.error(resource)
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

export const AnimateMap: React.FC<AnimateMapProps> = () => {
  const [isAppInited, setIsAppInited] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAppInited && containerRef && containerRef.current) {
      const app = new Application();

      app.init(containerRef.current as HTMLDivElement).then(() => {
        app.start();
      });

      setIsAppInited(true);
    }
  }, [containerRef, isAppInited]);

  return <div ref={containerRef} className="AnimateMap" />;
};
