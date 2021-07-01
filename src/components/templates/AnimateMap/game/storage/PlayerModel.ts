import { Model } from "../utils/Model";

interface IPlayerModel {
  x: number;
  y: number;
  avatarUrl: string;
}

class PlayerModel extends Model {
  constructor(
    attributes: IPlayerModel = {
      x: 0,
      y: 0,
      avatarUrl: "",
    }
  ) {
    super(attributes);
  }
}

const playerModel = new PlayerModel();
export default playerModel;
