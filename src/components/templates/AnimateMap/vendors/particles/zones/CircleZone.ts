/**
 * The CircleZone zone defines a circular zone. The zone may
 * have a hole in the middle, like a doughnut.
 */

import Particle2D from "../particles/Particle2D";
import { Point, Zone2D } from "./Zone2D";

export default class CircleZone implements Zone2D {
  protected _center: Point;
  protected _outerRadius: number;
  protected _outerSq: number;

  protected static TWOPI = Math.PI * 2;

  /**
   * The constructor defines a CircleZone zone.
   *
   * @param center The centre of the disc.
   * @param outerRadius The radius of the outer edge of the disc.
   * @param innerRadius If set, this defines the radius of the inner
   * edge of the disc. Points closer to the center than this inner radius
   * are excluded from the zone. If this parameter is not set then all
   * points inside the outer radius are included in the zone.
   */
  constructor(center: Point, outerRadius = 0) {
    if (center == null) {
      this._center = { x: 0, y: 0 };
    } else {
      this._center = center;
    }
    this._outerRadius = outerRadius;
    this._outerSq = this._outerRadius * this._outerRadius;
  }

  /**
   * The centre of the disc.
   */
  public get center(): Point {
    return this._center;
  }

  public set center(value: Point) {
    this._center = value;
  }

  /**
   * The x coordinate of the point that is the center of the disc.
   */
  public get centerX(): number {
    return this._center.x;
  }

  public set centerX(value: number) {
    this._center.x = value;
  }

  /**
   * The y coordinate of the point that is the center of the disc.
   */
  public get centerY(): number {
    return this._center.y;
  }

  public set centerY(value: number) {
    this._center.y = value;
  }

  /**
   * The radius of the outer edge of the disc.
   */
  public get outerRadius(): number {
    return this._outerRadius;
  }

  public set outerRadius(value: number) {
    this._outerRadius = value;
    this._outerSq = this._outerRadius * this._outerRadius;
  }

  /**
   * The contains method determines whether a point is inside the zone.
   * This method is used by the initializers and actions that
   * use the zone. Usually, it need not be called directly by the user.
   *
   * @param x The x coordinate of the location to test for.
   * @param y The y coordinate of the location to test for.
   * @return true if point is inside the zone, false if it is outside.
   */
  public contains(x: number, y: number): boolean {
    x -= this._center.x;
    y -= this._center.y;
    const distSq = x * x + y * y;
    return distSq <= this._outerSq; // && distSq >= this._innerSq;
  }

  /**
   * The getLocation method returns a random point inside the zone.
   * This method is used by the initializers and actions that
   * use the zone. Usually, it need not be called directly by the user.
   *
   * @return a random point inside the zone.
   */
  public getLocation(): Point {
    const rand = Math.random();
    const point: Point = this.getPolar(
      0 + (1 - rand * rand) * (this._outerRadius - 0),
      Math.random() * CircleZone.TWOPI
    );
    point.x += this._center.x;
    point.y += this._center.y;
    return point;
  }

  /**
   * The getArea method returns the size of the zone.
   * This method is used by the MultiZone class. Usually,
   * it need not be called directly by the user.
   *
   * @return a random point inside the zone.
   */
  public getArea(): number {
    return Math.PI * (this._outerSq - 0);
  }

  /**
   * Manages collisions between a particle and the zone. The particle will collide with the edges of
   * the disc defined for this zone, from inside or outside the disc.  The collisionRadius of the
   * particle is used when calculating the collision.
   *
   * @param particle The particle to be tested for collision with the zone.
   * @param bounce The coefficient of restitution for the collision.
   *
   * @return Whether a collision occured.
   */
  public collideParticle(particle: Particle2D, bounce = 1): boolean {
    let outerLimit = 0;
    let outerLimitSq = 0;
    let distanceSq = 0;
    let distance = 0;
    let pdx = 0;
    let pdy = 0;
    let pDistanceSq = 0;
    let adjustSpeed = 0;
    let positionRatio = 0;
    const epsilon = 0.001;
    const dx = particle.x - this._center.x;
    const dy = particle.y - this._center.y;
    let dotProduct = particle.velX * dx + particle.velY * dy;
    dotProduct =
      dotProduct > 0 ? -1 * dotProduct : dotProduct === 0 ? -0.001 : dotProduct;

    outerLimit = this._outerRadius + particle.collisionRadius;
    if (Math.abs(dx) > outerLimit) return false;
    if (Math.abs(dy) > outerLimit) return false;
    distanceSq = dx * dx + dy * dy;
    outerLimitSq = outerLimit * outerLimit;
    if (distanceSq > outerLimitSq) return false;
    // Particle is inside outer circle

    pdx = particle.previousX - this._center.x;
    pdy = particle.previousY - this._center.y;
    pDistanceSq = pdx * pdx + pdy * pdy;
    if (pDistanceSq > outerLimitSq) {
      // particle was outside outer circle
      adjustSpeed = ((1 + bounce) * dotProduct) / distanceSq;
      particle.velX -= adjustSpeed * dx;
      particle.velY -= adjustSpeed * dy;
      distance = Math.sqrt(distanceSq);
      positionRatio = (2 * outerLimit - distance) / distance + epsilon;
      particle.x = this._center.x + dx * positionRatio;
      particle.y = this._center.y + dy * positionRatio;
      return true;
    }

    return false;
  }

  protected getPolar(r: number, theta: number): Point {
    return {
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    };
  }
}
