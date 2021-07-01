import { Box, QuadTree } from "js-quadtree";
import {
  AnimateMapConfig,
  ReplicatedUser,
  ReplicatedVenue,
} from "../storage/GlobalStorage";

export interface GameStateProps {
  worldWidth: number;
  worldHeight: number;
  zoom: number;
  layer: number;
  cameraRect: Box;
  hero: ReplicatedUser | null;
  users: Map<string, ReplicatedUser>;
  venues: Map<string, ReplicatedVenue>;
  usersQT: QuadTree | null;
  venuesQT: QuadTree | null;
  config: AnimateMapConfig | null;
}

export default {
  worldWidth: 9920,
  worldHeight: 9920,
  zoom: 5,
  cameraRect: new Box(0, 0, 10000, 10000),
  hero: null,
  users: new Map(),
  venues: new Map(),
  usersQT: null,
  venuesQT: null,
  config: new AnimateMapConfig(),
} as GameStateProps;
