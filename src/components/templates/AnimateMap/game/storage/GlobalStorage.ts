import { Model } from "../utils/Model";
import { Box, QuadTree } from "js-quadtree";

export type AnimateMapWorldBounds = { width: number; height: number };

export interface AnimateMapPoint {
  x: number; //integer
  y: number; //integer
}

export interface ReplicatedUserData {
  id: string;
  videoUrlString: string;
  avatarUrlString: string;
  dotColor: number; //hex
}

export interface ReplicatedUser extends AnimateMapPoint {
  data: ReplicatedUserData;
}

export interface ReplicatedVenueData {
  id: string;
  videoUrlString: string;
  imageUrlString: string;
}

export interface ReplicatedVenue extends AnimateMapPoint {
  data: ReplicatedVenueData;
}

// function generateNewQuadtree(
//   items: Map<string, ReplicatedVenue | ReplicatedUser>,
//   quadTree: QuadTree | null
// ): QuadTree {
//   if (!quadTree) {
//     // create tree
//     quadTree = new QuadTree(
//       new Box(0, 0, state.worldWidth, state.worldHeight),
//       { maximumDepth: 100 },
//       Array.from(items).map(([key, value]) => value)
//     );
//     return quadTree;
//   } else {
//     // update tree
//     quadTree.clear(); //NOTE: can optimize if we will remove certain elements before update
//     quadTree.insert(Array.from(items).map(([key, value]) => value));
//     return quadTree;
//   }
// }

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
