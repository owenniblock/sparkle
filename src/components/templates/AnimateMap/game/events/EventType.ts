import { Box } from "js-quadtree";
import { ReplicatedUser, ReplicatedVenue } from "../storage/GlobalStorage";

export enum EventType {
  UPDATE_CAMERA_ZOOM = "EventType.UPDATE_CAMERA_ZOOM",
  UPDATE_CAMERA_RECT = "EventType.UPDATE_CAMERA_RECT",
  UPDATE_USERS = "EventType.UPDATE_USERS",
  UPDATE_VENUES = "EventType.UPDATE_VENUES",
  UPDATE_PLAYER_POSITION = "EventType.UPDATE_PLAYER_POSITION",
  POINTERDOWN_ON_VIEWPORT = "EventType.POINTERDOWN_ON_VIEWPORT",
}

export type EventUpdateCameraZoomProps = number;

export type EventUpdateCameraRectProps = Box;

export type EventUpdateUsersProps = ReplicatedUser[];

export type EventUpdateVenuesProps = ReplicatedVenue[];

export type EventUpdatePlayerPositionProps = {
  x: number;
  y: number;
};
