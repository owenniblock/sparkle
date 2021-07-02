/**
 * Usage interfaces for GameInstance class
 */
import { Point } from "./DataProvider/BufferingDataProvider";

export interface IBufferingDataProvider {
  on(eventName: string, callback: Function): void;

  off(eventName: string, callback: Function): void;

  // eslint-disable-next-line
  emit(eventName: string, props: any): void;

  update(dt: number): void;

  release: () => void;

  // player: IPlayerDataProvider;
  player: IPlayerDataProvider;
  initPlayerPositionAsync: (x: number, y: number) => Promise<void>;
  setPlayerPosition: (x: number, y: number) => void;
}

export interface IPlayerDataProvider {
  // initPositionAsync: (x: number, y: number) => Promise<void>;
  // setPosition: (x: number, y: number) => void;
  isReady: () => boolean;
  position: Point;
}
