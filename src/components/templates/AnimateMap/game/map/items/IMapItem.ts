export interface MapItemProps {
  name: string;
  x: number;
  y: number;
  scale: number;
  image: string | null;
}

export const MapItemDefaultProps = {
  name: Math.random().toString(),
  x: 0,
  y: 0,
  scale: 1,
  image: null,
};

export interface IMapItem {
  init(): Promise<void>;
  release(): Promise<void>;
}
