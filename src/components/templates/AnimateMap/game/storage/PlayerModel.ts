import {
  AnimateMapEntityType,
  ReplicatedUser,
  ReplicatedUserData,
} from "./GlobalStorage";
import { ANONYMOUS_PROFILE_ICON } from "../constants/AssetConstants";

class PlayerModel implements ReplicatedUser {
  data: ReplicatedUserData = {
    videoUrlString: ANONYMOUS_PROFILE_ICON,
    avatarUrlString: ANONYMOUS_PROFILE_ICON,
    dotColor: Math.floor(Math.random() * 16777215),
  };
  id: string = "";
  type: AnimateMapEntityType = AnimateMapEntityType.userWithControls;
  x: number = 4960;
  y: number = 4960;
}

const playerModel = new PlayerModel();
export default playerModel;
