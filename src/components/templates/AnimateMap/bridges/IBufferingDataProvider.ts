/**
 * Usage interfaces for GameInstance class
 */
export interface IBufferingDataProvider {
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
