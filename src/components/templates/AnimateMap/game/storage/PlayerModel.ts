import { Model } from "../utils/Model";
import {
  AnimateMapEntityType,
  ReplicatedUser,
  ReplicatedUserData,
} from "./GlobalStorage";
import { ANONYMOUS_PROFILE_ICON } from "../constants/AssetConstants";

// interface IPlayerModel {
//   x: number;
//   y: number;
//

class PlayerModel extends Model implements ReplicatedUser {
  data: ReplicatedUserData = {
    videoUrlString: ANONYMOUS_PROFILE_ICON,
    avatarUrlString: ANONYMOUS_PROFILE_ICON,
    dotColor: Math.floor(Math.random() * 16777215),
  };
  id: string = "tgbcwmTuh0gNwyvU1HTPvp5TMWB2";
  type: AnimateMapEntityType = AnimateMapEntityType.userWithControls;
  x: number = 9920 / 2;
  y: number = 9920 / 2;

  constructor(attributes = {}) {
    super(attributes);
  }
}

const playerModel = new PlayerModel();
export default playerModel;
