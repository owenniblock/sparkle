/**
 * Usage interfaces for GameInstance class
 */
import { Point } from "./DataProvider/BufferingDataProvider";

export interface IBufferingDataProvider {
  on(eventName: string, callback: Function, context?: object): void;

  off(eventName: string, callback: Function): void;

  // eslint-disable-next-line
  emit(eventName: string, props: any): void;

  update(dt: number): void;

  release: () => void;

  // player
  player: IPlayerDataProvider;
  initPlayerPositionAsync: (x: number, y: number) => Promise<boolean | void>;
  setPlayerPosition: (x: number, y: number) => void;
}

export interface IPlayerDataProvider {
  isReady: () => boolean;
  position: Point;
  id: string;
}
