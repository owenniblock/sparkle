import {
  ReplicatedUser,
  ReplicatedUserData,
  ReplicatedVenue,
  ReplicatedVenueData,
} from "store/reducers/AnimateMap";
import { MapItem } from "./MapItem";
import { MapItemSprite } from "./MapItemSprite";

export const getVenuesForRender = (
  layer: number | undefined,
  points: ReplicatedVenue[] | null
): MapItem[] => {
  if (!points?.length) {
    return [];
  }

  const items: MapItem[] = [];

  switch (layer) {
    case 0:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedVenueData;
        items.push(
          new MapItemSprite({
            name: `venue1_${i}`,
            x: point.x,
            y: point.y,
            scale: 1,
            image: data.imageUrlString,
          })
        );
      });
      break;

    case 1:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedVenueData;
        items.push(
          new MapItemSprite({
            name: `venue2_${i}`,
            x: point.x,
            y: point.y,
            scale: 0.8,
            image: data.imageUrlString,
          })
        );
      });
      break;

    case 2:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedVenueData;
        items.push(
          new MapItemSprite({
            name: `venue3_${i}`,
            x: point.x,
            y: point.y,
            scale: 0.6,
            image: data.imageUrlString,
          })
        );
      });
      break;
  }

  return items;
};

export const getUsersForRender = (
  layer: number | undefined,
  points: ReplicatedUser[] | null
): MapItem[] => {
  if (!points?.length) {
    return [];
  }

  const items: MapItem[] = [];

  switch (layer) {
    case 0:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedUserData;
        items.push(
          new MapItemSprite({
            name: `user1_${i}`,
            x: point.x,
            y: point.y,
            scale: 1,
            image: data.avatarUrlString,
          })
        );
      });
      break;

    case 1:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedUserData;
        items.push(
          new MapItemSprite({
            name: `user2_${i}`,
            x: point.x,
            y: point.y,
            scale: 0.8,
            image: data.avatarUrlString,
          })
        );
      });
      break;

    case 2:
      points.forEach((point, i) => {
        const data = point.data as ReplicatedUserData;
        items.push(
          new MapItemSprite({
            name: `user3_${i}`,
            x: point.x,
            y: point.y,
            scale: 0.6,
            image: data.avatarUrlString,
          })
        );
      });
      break;
  }

  return items;
};
