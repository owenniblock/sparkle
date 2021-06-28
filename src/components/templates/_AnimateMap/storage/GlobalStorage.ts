import { Model } from "../utils/Model";
import {
  ReplicatedUser,
  ReplicatedVenue,
} from "../../../../store/reducers/AnimateMap";
import { Box, QuadTree } from "js-quadtree";

export interface IGlobalStorage {
  worldWidth: number;
  worldHeight: number;
  zoom: number;
  layer: number;
  cameraRect: Box;
  users: Map<string, ReplicatedUser>;
  venues: Map<string, ReplicatedVenue>;
  usersQT: QuadTree | null;
  venuesQT: QuadTree | null;
}

export default new Model({
  worldWidth: 9920,
  worldHeight: 9920,
  zoom: 5,
  cameraRect: new Box(0, 0, 10000, 10000),
  users: new Map(),
  venues: new Map(),
  usersQT: null,
  venuesQT: null,
} as IGlobalStorage);
