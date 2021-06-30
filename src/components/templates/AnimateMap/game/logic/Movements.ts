import ActionCallback from "../../particles/actions/ActionCallback";
import BoundingBox from "../../particles/actions/BoundingBox";
import CollisionZone from "../../particles/actions/CollisionZone";
import Move from "../../particles/actions/Move";
import SpeedLimit from "../../particles/actions/SpeedLimit";
import TurnTowardsPoint from "../../particles/actions/TurnTowardsPoint";
import ZonedAction from "../../particles/actions/ZonedAction";
import Emitter from "../../particles/emitters/Emitter";
import CircleZone from "../../particles/zones/CircleZone";
import RectangleZone from "../../particles/zones/RectangleZone";
import { Point } from "../../particles/zones/Zone2D";
import GlobalStorage, {
  ReplicatedUser,
  ReplicatedVenue,
} from "../storage/GlobalStorage";
import TickProvider from "../utils/TickProvider";
import CustomParticle from "./CustomParticle";
import UpdateUserPositionAction from "./UpdateUserPositionAction";

export default class Movements {
  private tickProvider: TickProvider | null = null;

  private hero: ReplicatedUser | null = null;
  private heroParticle: CustomParticle | null = null;
  private users: Map<string, ReplicatedUser> | null = null;
  private venues: Map<string, ReplicatedVenue> | null = null;

  private emitters: Array<Emitter> = [];

  private WALKER_DEFAULT_SPEED = 100;
  private VENUE_DEFAULT_COLLISION_RADIUS = 100;
  private WALKER_DEFAULT_COLLISION_RADIUS = 10;

  init() {
    // this.hero = GlobalStorage.get('hero');
    this.users = GlobalStorage.get("users");
    this.venues = GlobalStorage.get("venues");

    this.setupMainEmitter();
    this.setupVenues();
    // this.setupHero();
    this.setupBotes();

    this.tickProvider = new TickProvider(this.update);
    this.tickProvider.start();
  }

  public async release(): Promise<void> {
    if (this.tickProvider) {
      this.tickProvider.release();
    }

    this.hero = null;
    this.users = null;
    this.venues = null;

    return Promise.resolve();
  }

  private update = (time: number): void => {
    // console.log('update')
    for (let i = 0; i < this.emitters.length; i++) {
      this.emitters[0].update(time);
    }
  };

  private setupMainEmitter(): void {
    const emitter: Emitter = new Emitter();
    emitter.actions = [
      new Move(),
      new SpeedLimit(this.WALKER_DEFAULT_SPEED, false),
      new BoundingBox(
        100,
        100,
        GlobalStorage.get("worldWidth") - 100,
        GlobalStorage.get("worldHeight") - 100
      ),
      new UpdateUserPositionAction(),
    ];
    this.emitters.push(emitter);
  }

  private setupVenues(): void {
    const mainEmitter: Emitter = this.emitters[0];
    const itr:
      | IterableIterator<ReplicatedVenue>
      | undefined = this.venues?.values();
    if (!itr) {
      return;
    }

    for (
      let venue: ReplicatedVenue | null = itr.next().value;
      venue;
      venue = itr.next().value
    ) {
      mainEmitter.addAction(new CollisionZone(new CircleZone(venue, 100)));
    }
  }

  // private setupHero(): void {
  //   const mainEmitter: Emitter = this.emitters[0];
  //   const itr: IterableIterator<ReplicatedUser> | undefined = this.users?.values();
  //   if (!itr) {
  //     return;
  //   }
  //   this.heroParticle = mainEmitter.particles[0]! as CustomParticle;
  //   this.hero = this.heroParticle.user;
  // }

  private setupBotes(): void {
    const mainEmitter: Emitter = this.emitters[0];
    const itr:
      | IterableIterator<ReplicatedUser>
      | undefined = this.users?.values();
    if (!itr) {
      return;
    }

    for (
      let user: ReplicatedUser | null = itr.next().value;
      user;
      user = itr.next().value
    ) {
      const hero: CustomParticle = new CustomParticle(user);
      hero.x = user.x;
      hero.y = user.y;
      hero.collisionRadius = this.WALKER_DEFAULT_COLLISION_RADIUS;
      mainEmitter.addParticle(hero);

      // create own control emitter
      const destinationZone: RectangleZone = new RectangleZone();
      const turnTowardsPoint: TurnTowardsPoint = new TurnTowardsPoint(
        0,
        0,
        500
      );
      const startWalkToNextZone = () => {
        hero.velX = this.getRandom(-100, 100);
        hero.velY = this.getRandom(-100, 100);

        const point: Point = this.getBotNewDestinationPoint();
        turnTowardsPoint.x = point.x;
        turnTowardsPoint.y = point.y;

        const precision = 5;
        destinationZone.left = turnTowardsPoint.x - precision;
        destinationZone.top = turnTowardsPoint.y - precision;
        destinationZone.right = turnTowardsPoint.x + precision;
        destinationZone.bottom = turnTowardsPoint.y + precision;
      };
      const zonedAction: ZonedAction = new ZonedAction(
        new ActionCallback(() => {
          startWalkToNextZone();
        }, false),
        destinationZone
      );

      const heroEmitter: Emitter = new Emitter();
      heroEmitter.actions = [turnTowardsPoint, zonedAction];
      heroEmitter.addParticle(hero);
      this.emitters.push(heroEmitter);

      // start bot
      startWalkToNextZone();
    }
  }

  private getBotNewDestinationPoint(): Point {
    const x = this.getRandom(100, GlobalStorage.get("worldWidth") - 100);
    const y = this.getRandom(100, GlobalStorage.get("worldHeight") - 100);

    let br = false;
    if (this.venues) {
      const itr: IterableIterator<ReplicatedVenue> = this.venues?.values();
      for (
        let venue: ReplicatedVenue | null = itr.next().value;
        venue;
        venue = itr.next().value
      ) {
        const r = this.VENUE_DEFAULT_COLLISION_RADIUS;
        if (
          venue.x - r < x &&
          venue.x + r > x &&
          venue.y - r < y &&
          venue.y + r > y
        ) {
          br = true;
          break;
        }
      }
    }

    if (br) {
      return this.getBotNewDestinationPoint();
    } else {
      return { x, y };
    }
  }

  private getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
