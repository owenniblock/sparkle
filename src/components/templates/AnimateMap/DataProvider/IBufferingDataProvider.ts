/**
 * Usage interface for GameInstance class
 */
export interface IBufferingDataProvider {
  initPlayerPositionAsync: (x: number, y: number) => Promise<void>;
  setPlayerPosition: (x: number, y: number) => void;
  isPlayerReady: () => boolean;
}
