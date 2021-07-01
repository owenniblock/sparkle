/**
 * Usage interfaces for GameInstance class
 */
export interface IBufferingDataProvider {
  on(eventName: string, callback: Function): void;
  off(eventName: string, callback: Function): void;
  emit(eventName: string, props: any): void;

  // player: IPlayerDataProvider;
  release: () => void;
  initPlayerPositionAsync: (x: number, y: number) => Promise<void>;
  setPlayerPosition: (x: number, y: number) => void;
}

export interface IPlayerDataProvider {
  initPositionAsync: (x: number, y: number) => Promise<void>;
  setPosition: (x: number, y: number) => void;
  isReady: () => boolean;
}
