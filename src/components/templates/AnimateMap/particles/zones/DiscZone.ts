/**
 * The DiscZone zone defines a circular zone. The zone may
 * have a hole in the middle, like a doughnut.
 */

import Particle2D from "../particles/Particle2D";
import CircleZone from "./CircleZone";
import { Point } from "./Zone2D";

export default class DiscZone extends CircleZone {
  private _innerRadius: number;
  private _innerSq: number;

  /**
   * The constructor defines a DiscZone zone.
   *
   * @param center The centre of the disc.
   * @param outerRadius The radius of the outer edge of the disc.
   * @param innerRadius If set, this defines the radius of the inner
   * edge of the disc. Points closer to the center than this inner radius
   * are excluded from the zone. If this parameter is not set then all
   * points inside the outer radius are included in the zone.
   */
  constructor(center: Point, outerRadius = 0, innerRadius = 0) {
    super(center, outerRadius);

    if (outerRadius < innerRadius) {
      throw new Error(
        "The outerRadius (" +
          outerRadius +
          ") can't be smaller than the innerRadius (" +
          innerRadius +
          ") in your DiscZone. N.B. the outerRadius is the second argument in the constructor and the innerRadius is the third argument."
      );
    }

    this._innerRadius = innerRadius;
    this._innerSq = this._innerRadius * this._innerRadius;
  }

  /**
   * The radius of the inner edge of the disc.
   */
  public get innerRadius(): number {
    return this._innerRadius;
  }

  public set innerRadius(value: number) {
    this._innerRadius = value;
    this._innerSq = this._innerRadius * this._innerRadius;
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
    return distSq <= this._outerSq && distSq >= this._innerSq;
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
      this._innerRadius +
        (1 - rand * rand) * (this._outerRadius - this._innerRadius),
      Math.random() * DiscZone.TWOPI
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
    return Math.PI * (this._outerSq - this._innerSq);
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
    let outerLimit: number;
    let innerLimit: number;
    let outerLimitSq: number;
    let innerLimitSq: number;
    let distanceSq: number;
    let distance: number;
    let pdx: number;
    let pdy: number;
    let pDistanceSq: number;
    let adjustSpeed: number;
    let positionRatio: number;
    const epsilon = 0.001;
    const dx = particle.x - this._center.x;
    const dy = particle.y - this._center.y;
    const dotProduct = particle.velX * dx + particle.velY * dy;
    if (dotProduct < 0) {
      // moving towards center
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

      if (this._innerRadius !== 0 && this.innerRadius !== this._outerRadius) {
        innerLimit = this._innerRadius + particle.collisionRadius;
        if (Math.abs(dx) > innerLimit) return false;
        if (Math.abs(dy) > innerLimit) return false;
        innerLimitSq = innerLimit * innerLimit;
        if (distanceSq > innerLimitSq) return false;
        // Particle is inside inner circle

        if (pDistanceSq > innerLimitSq) {
          // particle was outside inner circle
          adjustSpeed = ((1 + bounce) * dotProduct) / distanceSq;
          particle.velX -= adjustSpeed * dx;
          particle.velY -= adjustSpeed * dy;
          distance = Math.sqrt(distanceSq);
          positionRatio = (2 * innerLimit - distance) / distance + epsilon;
          particle.x = this._center.x + dx * positionRatio;
          particle.y = this._center.y + dy * positionRatio;
          return true;
        }
      }
      return false;
    } // moving away from center
    else {
      outerLimit = this._outerRadius - particle.collisionRadius;
      pdx = particle.previousX - this._center.x;
      pdy = particle.previousY - this._center.y;
      if (Math.abs(pdx) > outerLimit) return false;
      if (Math.abs(pdy) > outerLimit) return false;
      pDistanceSq = pdx * pdx + pdy * pdy;
      outerLimitSq = outerLimit * outerLimit;
      if (pDistanceSq > outerLimitSq) return false;
      // particle was inside outer circle

      distanceSq = dx * dx + dy * dy;

      if (this._innerRadius !== 0 && this.innerRadius !== this._outerRadius) {
        innerLimit = this._innerRadius - particle.collisionRadius;
        innerLimitSq = innerLimit * innerLimit;
        if (pDistanceSq < innerLimitSq && distanceSq >= innerLimitSq) {
          // particle was inside inner circle and is outside it
          adjustSpeed = ((1 + bounce) * dotProduct) / distanceSq;
          particle.velX -= adjustSpeed * dx;
          particle.velY -= adjustSpeed * dy;
          distance = Math.sqrt(distanceSq);
          positionRatio = (2 * innerLimit - distance) / distance - epsilon;
          particle.x = this._center.x + dx * positionRatio;
          particle.y = this._center.y + dy * positionRatio;
          return true;
        }
      }

      if (distanceSq >= outerLimitSq) {
        // Particle is inside outer circle
        adjustSpeed = ((1 + bounce) * dotProduct) / distanceSq;
        particle.velX -= adjustSpeed * dx;
        particle.velY -= adjustSpeed * dy;
        distance = Math.sqrt(distanceSq);
        positionRatio = (2 * outerLimit - distance) / distance - epsilon;
        particle.x = this._center.x + dx * positionRatio;
        particle.y = this._center.y + dy * positionRatio;
        return true;
      }
      return false;
    }
  }
}
