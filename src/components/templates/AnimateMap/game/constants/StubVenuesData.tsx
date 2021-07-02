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
import { getRandomInt } from "../../../../../utils/getRandomInt";

export const stubVenuesData = () => {
  const venues: Map<string, ReplicatedVenue> = new Map();
  const len = (GlobalStorage.get("config") as AnimateMapConfig)
    .QA_VENUES_NUMBER;
  const rand = [
    8362,
    5657,
    3587,
    1387,
    8019,
    2365,
    3836,
    5850,
    1636,
    6758,
    3107,
    3078,
    7052,
    6998,
    2342,
    7495,
    2020,
    1895,
    4030,
    7598,
    5082,
    3882,
    8889,
    7217,
    4125,
    3360,
    1225,
    2348,
    5120,
    4999,
    5578,
    6162,
    2085,
    4554,
    8786,
    3490,
    5315,
    3621,
    2393,
    8556,
    6021,
    3035,
    5472,
    3096,
    7028,
    2791,
    8040,
    4995,
    3079,
    6767,
    1702,
    1438,
    3425,
    8823,
    3610,
    8673,
    3577,
    7073,
    2253,
    6013,
    4198,
    7969,
    6966,
    8770,
    7334,
    8659,
    4111,
    8187,
    4248,
    2615,
    7624,
    1067,
    7856,
    1996,
    3708,
    2665,
    3530,
    4352,
    5544,
    6103,
    8587,
    7834,
    4567,
    6906,
    2574,
    5623,
    1223,
    4805,
    1059,
    5063,
    1172,
    1152,
    8435,
    6580,
    3554,
    5748,
    8720,
    4799,
    5600,
    2750,
    1391,
    6416,
    4996,
    2439,
    1986,
    8158,
    8005,
    6286,
    5051,
    8595,
    2698,
    6130,
    8312,
    5977,
    3419,
    6758,
    7299,
    4610,
    8545,
    3418,
    7978,
    4094,
    6325,
    4133,
    8092,
    7944,
    4743,
    6155,
    1623,
    3287,
    5316,
    3557,
    3514,
    1194,
    4055,
    6376,
    5810,
    8318,
    7622,
    7947,
    1532,
    1653,
    5931,
    6296,
    2868,
    1682,
    7817,
    4208,
    4419,
    4295,
    2209,
    8384,
    5943,
    1924,
    3924,
    6131,
    3774,
    7144,
  ];
  for (let i = 0; i < len; i++) {
    const x = rand[i];
    const y = rand[i];
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
