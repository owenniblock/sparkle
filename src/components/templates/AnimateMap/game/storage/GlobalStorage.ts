import { Model } from "../utils/Model";
import { Box, QuadTree } from "js-quadtree";

export enum AnimateMapEntityType {
  user,
  venue,
  userWithControls,
}

export interface AnimateMapEntity {
  type: AnimateMapEntityType;
  id: string;
  x: number;
  y: number;
  data: ReplicatedUserData | ReplicatedVenueData;
}

export interface ReplicatedUserData {
  videoUrlString: string;
  avatarUrlString: string | string[];
  dotColor: number; //hex
}

export interface ReplicatedUser extends AnimateMapEntity {
  data: ReplicatedUserData;
}

export interface ReplicatedVenueData {
  videoUrlString: string;
  imageUrlString: string | string[];
}

export interface ReplicatedVenue extends AnimateMapEntity {
  data: ReplicatedVenueData;
}

export class AnimateMapConfig {
  WALKER_DEFAULT_SPEED = 10;
  QA_BOTS_NUMBER = 100;
  QA_VENUES_NUMBER = 80;
}

export interface IGlobalStorage {
  worldWidth: number;
  worldHeight: number;
  zoom: number;
  layer: number;
  cameraRect: Box;
  hero: ReplicatedUser | null;
  users: Map<string, ReplicatedUser>;
  replicatedUsers: Map<string, ReplicatedUser>;
  venues: Map<string, ReplicatedVenue>;
  usersQT: QuadTree | null;
  venuesQT: QuadTree | null;
  config: AnimateMapConfig | null;
}

export default new Model({
  worldWidth: 9920,
  worldHeight: 9920,
  zoom: 5,
  cameraRect: new Box(0, 0, 0, 0),
  hero: null,
  users: new Map(),
  replicatedUsers: new Map(),
  venues: new Map(),
  usersQT: null,
  venuesQT: null,
  config: new AnimateMapConfig(),
} as IGlobalStorage);
