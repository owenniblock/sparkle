export interface MapItemProps {
  name: string;
  x: number;
  y: number;
  scale: number;
  image: string | null;
}

export interface IMapItem {
  init(): Promise<void>;
  release(): Promise<void>;
}
