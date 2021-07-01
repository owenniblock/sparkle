import { getRandomInt } from "../../../../../utils/getRandomInt";
import { uuid } from "uuidv4";
import {
  avatars,
  default_avatars,
  ROOM_ICON_3,
  ROOM_ICON_7,
  ROOM_ICON_8,
} from "./AssetConstants";
import GlobalStorage, {
  AnimateMapConfig,
  AnimateMapEntityType,
  ReplicatedUser,
  ReplicatedVenue,
} from "../storage/GlobalStorage";

export const stubVenuesData = () => {
  const venues: Map<string, ReplicatedVenue> = new Map();
  const len = (GlobalStorage.get("config") as AnimateMapConfig)
    .QA_VENUES_NUMBER;
  const paddingH = GlobalStorage.get("worldWidth") * 0.1;
  const paddingV = GlobalStorage.get("worldHeight") * 0.1;
  for (let i = 0; i < len; i++) {
    const x =
      getRandomInt(GlobalStorage.get("worldWidth") - paddingH * 2) + paddingH;
    const y =
      getRandomInt(GlobalStorage.get("worldHeight") - paddingV * 2) + paddingV;
    venues.set(i.toString(), {
      id: uuid(),
      type: AnimateMapEntityType.venue,
      x,
      y,
      data: {
        videoUrlString: "",
        imageUrlString: [ROOM_ICON_3, ROOM_ICON_7, ROOM_ICON_8],
      },
    });
  }
  return venues;
};

export const stubUsersData = () => {
  const users: Map<string, ReplicatedUser> = new Map();
  const len = (GlobalStorage.get("config") as AnimateMapConfig).QA_BOTS_NUMBER;
  const paddingH = GlobalStorage.get("worldWidth") * 0.1;
  const paddingV = GlobalStorage.get("worldHeight") * 0.1;
  for (let i = 0; i < len; i++) {
    const x =
      getRandomInt(GlobalStorage.get("worldWidth") - paddingH * 2) + paddingH;
    const y =
      getRandomInt(GlobalStorage.get("worldHeight") - paddingV * 2) + paddingV;
    users.set(i.toString(), {
      id: uuid(),
      type: AnimateMapEntityType.user,
      x,
      y,
      data: {
        videoUrlString: avatars[x % 12],
        avatarUrlString: default_avatars[y % 4],
        dotColor: Math.floor(Math.random() * 16777215),
      },
    });
  }
  return users;
};
