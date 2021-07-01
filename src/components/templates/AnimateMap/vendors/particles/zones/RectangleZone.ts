import Particle from "../particles/Particle2D";
import { Point, Zone2D } from "./Zone2D";

export default class RectangleZone implements Zone2D {
  private _left: number;
  private _top: number;
  private _right: number;
  private _bottom: number;
  private _width: number;
  private _height: number;

  /**
   * The constructor creates a RectangleZone zone.
   *
   * @param left The left coordinate of the rectangle defining the region of the zone.
   * @param top The top coordinate of the rectangle defining the region of the zone.
   * @param right The right coordinate of the rectangle defining the region of the zone.
   * @param bottom The bottom coordinate of the rectangle defining the region of the zone.
   */
  constructor(left = 0, top = 0, right = 0, bottom = 0) {
    this._left = left;
    this._top = top;
    this._right = right;
    this._bottom = bottom;
    this._width = right - left;
    this._height = bottom - top;
  }

  /**
   * The left coordinate of the rectangle defining the region of the zone.
   */
  public get left(): number {
    return this._left;
  }

  public set left(value: number) {
    this._left = value;
    if (!isNaN(this._right) && !isNaN(this._left)) {
      this._width = this.right - this.left;
    }
  }

  /**
   * The right coordinate of the rectangle defining the region of the zone.
   */
  public get right(): number {
    return this._right;
  }

  public set right(value: number) {
    this._right = value;
    if (!isNaN(this._right) && !isNaN(this._left)) {
      this._width = this.right - this.left;
    }
  }

  /**
   * The top coordinate of the rectangle defining the region of the zone.
   */
  public get top(): number {
    return this._top;
  }

  public set top(value: number) {
    this._top = value;
    if (!isNaN(this._top) && !isNaN(this._bottom)) {
      this._height = this.bottom - this.top;
    }
  }

  /**
   * The bottom coordinate of the rectangle defining the region of the zone.
   */
  public get bottom(): number {
    return this._bottom;
  }

  public set bottom(value: number) {
    this._bottom = value;
    if (!isNaN(this._top) && !isNaN(this._bottom)) {
      this._height = this.bottom - this.top;
    }
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
    return (
      x >= this._left && x <= this._right && y >= this._top && y <= this._bottom
    );
  }

  /**
   * The getLocation method returns a random point inside the zone.
   * This method is used by the initializers and actions that
   * use the zone. Usually, it need not be called directly by the user.
   *
   * @return a random point inside the zone.
   */
  public getLocation(): Point {
    return {
      x: this._left + Math.random() * this._width,
      y: this._top + Math.random() * this._height,
    };
  }

  /**
   * The getArea method returns the size of the zone.
   * This method is used by the MultiZone class. Usually,
   * it need not be called directly by the user.
   *
   * @return a random point inside the zone.
   */
  public getArea(): number {
    return this._width * this._height;
  }

  /**
   * Manages collisions between a particle and the zone. Particles will collide with the edges
   * of the rectangle defined for this zone, from inside or outside the zone. The collisionRadius
   * of the particle is used when calculating the collision.
   *
   * @param particle The particle to be tested for collision with the zone.
   * @param bounce The coefficient of restitution for the collision.
   *
   * @return Whether a collision occured.
   */
  public collideParticle(particle: Particle, bounce = 1): boolean {
    let position: number;
    let previousPosition: number;
    let intersect: number;
    let collision = false;

    if (particle.velX > 0) {
      position = particle.x + particle.collisionRadius;
      previousPosition = particle.previousX + particle.collisionRadius;
      if (previousPosition < this._left && position >= this._left) {
        intersect =
          particle.previousY +
          ((particle.y - particle.previousY) *
            (this._left - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._top - particle.collisionRadius &&
          intersect <= this._bottom + particle.collisionRadius
        ) {
          particle.velX = -particle.velX * bounce;
          particle.x += 2 * (this._left - position);
          collision = true;
        }
      } else if (previousPosition <= this._right && position > this._right) {
        intersect =
          particle.previousY +
          ((particle.y - particle.previousY) *
            (this._right - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._top - particle.collisionRadius &&
          intersect <= this._bottom + particle.collisionRadius
        ) {
          particle.velX = -particle.velX * bounce;
          particle.x += 2 * (this._right - position);
          collision = true;
        }
      }
    } else if (particle.velX < 0) {
      position = particle.x - particle.collisionRadius;
      previousPosition = particle.previousX - particle.collisionRadius;
      if (previousPosition > this._right && position <= this._right) {
        intersect =
          particle.previousY +
          ((particle.y - particle.previousY) *
            (this._right - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._top - particle.collisionRadius &&
          intersect <= this._bottom + particle.collisionRadius
        ) {
          particle.velX = -particle.velX * bounce;
          particle.x += 2 * (this._right - position);
          collision = true;
        }
      } else if (previousPosition >= this._left && position < this._left) {
        intersect =
          particle.previousY +
          ((particle.y - particle.previousY) *
            (this._left - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._top - particle.collisionRadius &&
          intersect <= this._bottom + particle.collisionRadius
        ) {
          particle.velX = -particle.velX * bounce;
          particle.x += 2 * (this._left - position);
          collision = true;
        }
      }
    }

    if (particle.velY > 0) {
      position = particle.y + particle.collisionRadius;
      previousPosition = particle.previousY + particle.collisionRadius;
      if (previousPosition < this._top && position >= this._top) {
        intersect =
          particle.previousX +
          ((particle.x - particle.previousX) * (this._top - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._left - particle.collisionRadius &&
          intersect <= this._right + particle.collisionRadius
        ) {
          particle.velY = -particle.velY * bounce;
          particle.y += 2 * (this._top - position);
          collision = true;
        }
      } else if (previousPosition <= this._bottom && position > this._bottom) {
        intersect =
          particle.previousX +
          ((particle.x - particle.previousX) *
            (this._bottom - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._left - particle.collisionRadius &&
          intersect <= this._right + particle.collisionRadius
        ) {
          particle.velY = -particle.velY * bounce;
          particle.y += 2 * (this._bottom - position);
          collision = true;
        }
      }
    } else if (particle.velY < 0) {
      position = particle.y - particle.collisionRadius;
      previousPosition = particle.previousY - particle.collisionRadius;
      if (previousPosition > this._bottom && position <= this._bottom) {
        intersect =
          particle.previousX +
          ((particle.x - particle.previousX) *
            (this._bottom - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._left - particle.collisionRadius &&
          intersect <= this._right + particle.collisionRadius
        ) {
          particle.velY = -particle.velY * bounce;
          particle.y += 2 * (this._bottom - position);
          collision = true;
        }
      } else if (previousPosition >= this._top && position < this._top) {
        intersect =
          particle.previousX +
          ((particle.x - particle.previousX) * (this._top - previousPosition)) /
            (position - previousPosition);
        if (
          intersect >= this._left - particle.collisionRadius &&
          intersect <= this._right + particle.collisionRadius
        ) {
          particle.velY = -particle.velY * bounce;
          particle.y += 2 * (this._top - position);
          collision = true;
        }
      }
    }

    return collision;
  }
}
