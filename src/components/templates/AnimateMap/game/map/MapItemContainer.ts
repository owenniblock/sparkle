import { Container } from "pixi.js";
import GlobalStorage, {
  AnimateMapEntity,
  AnimateMapEntityType,
  ReplicatedUser,
  ReplicatedUserData,
  ReplicatedVenue,
  ReplicatedVenueData,
} from "../storage/GlobalStorage";
import { ObjectPoolFactory } from "../utils/object-pool/ObjectPoolFactory";
import { ObjectPool } from "../utils/object-pool/ObjectPool";
import EventManager from "../events/EventManager";
import {
  EventType,
  EventUpdateUsersProps,
  EventUpdateVenuesProps,
} from "../events/EventType";
import { Box, QuadTree } from "js-quadtree";
import { MapItemSprite } from "./items/MapItemSprite";
import playerModel from "../storage/PlayerModel";

export class MapItemContainer extends Container {
  private _itemsSpritePoolSize: number = 200;
  private _itemsSpritePool: ObjectPool<MapItemSprite> = ObjectPoolFactory.build(
    MapItemSprite
  );
  private _itemsSpritePoolToIdMap: Map<string, MapItemSprite> = new Map();

  private _quadTree: QuadTree | null = null;
  private _quadTreeQuery: Array<ReplicatedUser | ReplicatedVenue> = [];
  private _previousQuadTreeQuery: Array<ReplicatedUser | ReplicatedVenue> = [];

  private _previousItems: AnimateMapEntity[] = [];

  private _updateQuadTreeDelay = 40; // ms
  private _updateQuadTreeTime = 0; // ms

  constructor() {
    super();

    this._itemsSpritePool.reserve(this._itemsSpritePoolSize);

    this._quadTree = new QuadTree(
      new Box(
        0,
        0,
        GlobalStorage.get("worldWidth"),
        GlobalStorage.get("worldHeight")
      ),
      { maximumDepth: 100 }
    );

    this.updateQuadTree();

    EventManager.on(EventType.UPDATE_CAMERA_RECT, this._onUpdateCamera, this);
    EventManager.on(EventType.UPDATE_CAMERA_ZOOM, this._onUpdateCamera, this);
    EventManager.on(EventType.UPDATE_USERS, this._onUpdateUsers, this);
    EventManager.on(EventType.UPDATE_VENUES, this._onUpdateVenues, this);
  }

  protected updateQuadTree(
    users: ReplicatedUser[] = Array.from(GlobalStorage.get("users")).map(
      // eslint-disable-next-line
      ([key, value]: any) => value
    ),
    venues: ReplicatedVenue[] = Array.from(GlobalStorage.get("venues")).map(
      // eslint-disable-next-line
      ([key, value]: any) => value
    )
  ): void {
    const zoom = GlobalStorage.get("zoom");
    const cameraRect = GlobalStorage.get("cameraRect");

    // FIXME: optimize
    // то что касается добавления и удаления из стейта
    const items = [...venues, ...users, playerModel] as AnimateMapEntity[];

    const removeItems = this._previousItems?.filter((x) => !items.includes(x));
    const addItems = items?.filter((x) => !this._previousItems.includes(x));

    this._previousItems = items;

    this._quadTree?.remove(removeItems.map((o) => o));
    this._quadTree?.insert(addItems.map((o) => o));
    //

    this._previousQuadTreeQuery = this._quadTreeQuery;
    // eslint-disable-next-line
    this._quadTreeQuery = this._quadTree?.query(cameraRect) as any; // FIXME: correct cast to AnimateMapEntity

    const removeQueryItems = this._previousQuadTreeQuery?.filter(
      (x) => !this._quadTreeQuery.includes(x)
    );
    const addQueryItems = this._quadTreeQuery?.filter(
      (x) => !this._previousQuadTreeQuery.includes(x)
    );

    removeQueryItems.forEach((item) => {
      const sprite = this._itemsSpritePoolToIdMap.get(item.id);

      if (sprite) {
        if (this.getChildIndex(sprite) >= 0) {
          this.removeChild(sprite);
        }

        sprite.release();

        this._itemsSpritePoolToIdMap.delete(item.id);
        this._itemsSpritePool?.release(sprite);
      }
    });

    addQueryItems.forEach((item) => {
      if (!this._itemsSpritePoolToIdMap.has(item.id)) {
        let mapSprite = null;

        switch (item.type) {
          case AnimateMapEntityType.user:
            mapSprite = this.getNewItem();
            mapSprite?.fillProps({
              x: item.x,
              y: item.y,
              scale: 1,
              name: item.id,
              image: this._getImageFromQueryItemAndZoom(item, zoom),
            });
            break;

          case AnimateMapEntityType.userWithControls:
            mapSprite = this.getNewItem();
            mapSprite?.fillProps({
              x: item.x,
              y: item.y,
              scale: 1,
              name: item.id,
              image: this._getImageFromQueryItemAndZoom(item, zoom),
            });
            break;

          case AnimateMapEntityType.venue:
            mapSprite = this.getNewItem();
            mapSprite?.fillProps({
              x: item.x,
              y: item.y,
              scale: 1,
              name: item.id,
              image: this._getImageFromQueryItemAndZoom(item, zoom),
            });
            break;
        }

        if (mapSprite) {
          this._itemsSpritePoolToIdMap.set(mapSprite.name, mapSprite);
          this.addChild(mapSprite);
        }
      }
    });
  }

  protected getNewItem(): MapItemSprite | null | undefined {
    const item = this._itemsSpritePool?.allocate();
    item?.init();
    return item;
  }

  protected clearAll(): void {
    while (this.children.length) {
      this.removeChildAt(0);
    }
    this._itemsSpritePool.limit(0);
  }

  public release(): void {
    if (this._quadTree) {
      this._quadTree.clear();
      this._quadTree = null;
    }

    EventManager.off(EventType.UPDATE_CAMERA_RECT, this._onUpdateCamera, this);
    EventManager.off(EventType.UPDATE_CAMERA_ZOOM, this._onUpdateCamera, this);
    EventManager.off(EventType.UPDATE_USERS, this._onUpdateUsers, this);
    EventManager.off(EventType.UPDATE_VENUES, this._onUpdateVenues, this);
  }

  public update(dt: number): void {
    this._quadTreeQuery.forEach((item) => {
      const sprite = this._itemsSpritePoolToIdMap.get(item.id);

      if (sprite) {
        sprite.x = item.x;
        sprite.y = item.y;
      }
    });

    // update for movement entities
    if (this._updateQuadTreeTime >= this._updateQuadTreeDelay) {
      this._updateQuadTreeTime = 0;
      this.updateQuadTree();
    } else {
      this._updateQuadTreeTime += dt;
    }
  }

  private _onUpdateCamera(): void {
    this.updateQuadTree();

    const zoom = GlobalStorage.get("zoom");

    this._quadTreeQuery.forEach((item) => {
      const sprite = this._itemsSpritePoolToIdMap.get(item.id);

      if (sprite) {
        const scale = [1, 0.8, 0.6];
        const image = this._getImageFromQueryItemAndZoom(item, zoom);

        sprite.fillProps({
          ...sprite.props,
          scale: scale[Math.min(zoom, scale.length - 1)],
          image: image,
        });
      }
    });
  }

  private _onUpdateUsers(users: EventUpdateUsersProps): void {
    this.updateQuadTree(
      // eslint-disable-next-line
      Array.from(users).map(([key, value]: any) => value),
      // eslint-disable-next-line
      Array.from(GlobalStorage.get("venues")).map(([key, value]: any) => value)
    );
  }

  private _onUpdateVenues(venues: EventUpdateVenuesProps): void {
    this.updateQuadTree(
      // eslint-disable-next-line
      Array.from(GlobalStorage.get("users")).map(([key, value]: any) => value),
      // eslint-disable-next-line
      Array.from(venues).map(([key, value]: any) => value)
    );
  }

  private _getImageFromQueryItemAndZoom(
    item: AnimateMapEntity,
    zoom: number
  ): string {
    let image = null;

    switch (item.type) {
      case AnimateMapEntityType.user:
        const avatarUrlString = (item.data as ReplicatedUserData)
          .avatarUrlString;

        if (Array.isArray(avatarUrlString)) {
          image = avatarUrlString[Math.min(zoom, avatarUrlString.length - 1)];
        } else {
          image = avatarUrlString;
        }
        break;

      case AnimateMapEntityType.userWithControls:
        const _avatarUrlString = (item.data as ReplicatedUserData)
          .avatarUrlString;

        if (Array.isArray(_avatarUrlString)) {
          image = _avatarUrlString[Math.min(zoom, _avatarUrlString.length - 1)];
        } else {
          image = _avatarUrlString;
        }
        break;

      case AnimateMapEntityType.venue:
        const imageUrlString = (item.data as ReplicatedVenueData)
          .imageUrlString;

        if (Array.isArray(imageUrlString)) {
          image = imageUrlString[Math.min(zoom, imageUrlString.length - 1)];
        } else {
          image = imageUrlString;
        }
        break;
    }

    return image;
  }
}
