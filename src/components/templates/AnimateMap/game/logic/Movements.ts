import ActionCallback from "../../vendors/particles/actions/ActionCallback";
import BoundingBox from "../../vendors/particles/actions/BoundingBox";
import CollisionZone from "../../vendors/particles/actions/CollisionZone";
import Move from "../../vendors/particles/actions/Move";
import SpeedLimit from "../../vendors/particles/actions/SpeedLimit";
import TurnTowardsPoint from "../../vendors/particles/actions/TurnTowardsPoint";
import ZonedAction from "../../vendors/particles/actions/ZonedAction";
import Emitter from "../../vendors/particles/emitters/Emitter";
import CircleZone from "../../vendors/particles/zones/CircleZone";
import RectangleZone from "../../vendors/particles/zones/RectangleZone";
import { Point } from "../../vendors/particles/zones/Zone2D";
import GlobalStorage, {
  AnimateMapConfig,
  ReplicatedUser,
  ReplicatedVenue,
} from "../storage/GlobalStorage";
import CustomParticle from "./CustomParticle";
import UpdateUserPositionAction from "./UpdateUserPositionAction";
import { KeyPoll } from "../utils/KeyPoll";
import * as Keyboard from "../utils/Keyboard";
import { FrameTickProvider } from "@ash.ts/tick";

export default class Movements {
  private hero: ReplicatedUser | null = null;
  private heroParticle: CustomParticle | null = null;
  private heroEmitter: Emitter | null = null;

  private users: Map<string, ReplicatedUser> | null = null;
  private venues: Map<string, ReplicatedVenue> | null = null;

  private emitters: Array<Emitter> = [];

  private WALKER_DEFAULT_SPEED = 100;
  private VENUE_DEFAULT_COLLISION_RADIUS = 100;
  private WALKER_DEFAULT_COLLISION_RADIUS = 10;

  init() {
    this.users = GlobalStorage.get("users");
    this.venues = GlobalStorage.get("venues");

    this.setupMainEmitter();
    this.setupVenues();
    this.setupBotes();
    this.setupHero();
  }

  public async release(): Promise<void> {
    this.hero = null;
    this.users = null;
    this.venues = null;

    return Promise.resolve();
  }

  public update = (time: number): void => {
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
        10,
        10,
        GlobalStorage.get("worldWidth") - 10,
        GlobalStorage.get("worldHeight") - 10
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

  private setupHero(): void {
    const mainEmitter: Emitter = this.emitters[0];
    const hero: ReplicatedUser = GlobalStorage.get("hero");
    if (hero) {
      // get hero from Model
      this.hero = hero;
      this.heroParticle = new CustomParticle(this.hero);
      this.heroParticle.x = this.hero.x;
      this.heroParticle.y = this.hero.y;
      this.heroParticle.collisionRadius = this.WALKER_DEFAULT_COLLISION_RADIUS;
      mainEmitter.addParticle(this.heroParticle);
    } else {
      // get hero from bots
      const itr:
        | IterableIterator<ReplicatedUser>
        | undefined = this.users?.values();
      if (!itr || !mainEmitter.particles.length) {
        return;
      }

      this.heroParticle = mainEmitter.particles[0] as CustomParticle;
      this.heroParticle.x = GlobalStorage.get("worldWidth") / 2;
      this.heroParticle.y = GlobalStorage.get("worldHeight") / 2;
      this.heroParticle.velX = 0;
      this.heroParticle.velY = 0;
      this.hero = this.heroParticle.user;
    }

    if (this.hero) {
      this.createHeroControlModule();
    }
  }

  private createHeroControlModule(): void {
    this.heroEmitter = new Emitter();
    this.heroEmitter.addParticle(this.heroParticle!);
    this.emitters.push(this.heroEmitter);

    let pointed = false;
    let keyboarded = false;

    const destinationZone: RectangleZone = new RectangleZone();
    const turnTowardsPoint: TurnTowardsPoint = new TurnTowardsPoint(
      window.innerWidth - 100,
      window.innerHeight - 100,
      500
    );

    const zonedAction: ZonedAction = new ZonedAction(
      new ActionCallback(() => {
        // end pointed
        pointed = false;

        if (!this.heroParticle || !this.heroEmitter) {
          return;
        }

        this.heroEmitter!.removeAction(turnTowardsPoint);
        this.heroEmitter!.removeAction(zonedAction);
        this.heroParticle.velX = 0;
        this.heroParticle.velY = 0;
      }, false),
      destinationZone
    );

    document.body.addEventListener("click", (e: MouseEvent) => {
      // start pointed
      pointed = true;
      keyboarded = !pointed;

      if (!this.heroParticle || !this.heroEmitter) {
        return;
      }

      this.heroParticle.velX = (GlobalStorage.get(
        "config"
      ) as AnimateMapConfig).WALKER_DEFAULT_SPEED;
      this.heroParticle.velY = this.heroParticle.velX;

      turnTowardsPoint.x = e.clientX;
      turnTowardsPoint.y = e.clientY;
      if (!this.heroEmitter.hasAction(turnTowardsPoint)) {
        this.heroEmitter.addAction(turnTowardsPoint);
      }

      const precision = 5;
      destinationZone.left = turnTowardsPoint.x - precision;
      destinationZone.top = turnTowardsPoint.y - precision;
      destinationZone.right = turnTowardsPoint.x + precision;
      destinationZone.bottom = turnTowardsPoint.y + precision;
      if (!this.heroEmitter.hasAction(zonedAction)) {
        this.heroEmitter.addAction(zonedAction);
      }
    });

    const speed = (GlobalStorage.get("config") as AnimateMapConfig)
      .WALKER_DEFAULT_SPEED;
    const keyPoll = new KeyPoll();
    const tickProvider = new FrameTickProvider();
    tickProvider.add((delta) => {
      let down = false;
      if (!this.heroParticle || !this.heroEmitter) {
        return;
      }
      if (keyPoll.isDown(Keyboard.W) || keyPoll.isDown(Keyboard.UP)) {
        down = true;
        this.heroParticle.velY = -speed;
      } else if (keyPoll.isDown(Keyboard.S) || keyPoll.isDown(Keyboard.DOWN)) {
        down = true;
        this.heroParticle.velY = speed;
      } else if (!pointed) {
        this.heroParticle.velY = 0;
      }
      if (keyPoll.isDown(Keyboard.A) || keyPoll.isDown(Keyboard.LEFT)) {
        down = true;
        this.heroParticle.velX = -speed;
      } else if (keyPoll.isDown(Keyboard.D) || keyPoll.isDown(Keyboard.RIGHT)) {
        down = true;
        this.heroParticle.velX = speed;
      } else if (!pointed) {
        this.heroParticle.velX = 0;
      }

      if (down) {
        // end pointed
        pointed = false;
        keyboarded = !pointed;
        this.heroEmitter.removeAction(turnTowardsPoint);
        this.heroEmitter.removeAction(zonedAction);
      } else if (keyboarded) {
        keyboarded = false;
        this.heroParticle.velX = 0;
        this.heroParticle.velY = 0;
      }
    });
    tickProvider.start();
  }

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
        const config: AnimateMapConfig = GlobalStorage.get("config");
        hero.velX = this.getRandom(
          -config.WALKER_DEFAULT_SPEED,
          config.WALKER_DEFAULT_SPEED
        );
        hero.velY = this.getRandom(
          -config.WALKER_DEFAULT_SPEED,
          config.WALKER_DEFAULT_SPEED
        );

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
