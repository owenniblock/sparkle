/**
 * The Particle class is a set of public properties shared by all particles.
 * It is deliberately lightweight, with only one method. The Initializers
 * and Actions modify these properties directly. This means that the same
 * particles can be used in many different emitters, allowing Particle
 * objects to be reused.
 *
 * Particles are usually created by the ParticleCreator class. This class
 * just simplifies the reuse of Particle objects which speeds up the
 * application.
 */
export default class Particle {
  /**
   * The 32bit ARGB color of the particle. The initial value is 0xFFFFFFFF (white).
   */
  public color = "#ffffff";

  //  private _colorTransform:ColorTransform = null;
  private _previousColor: string;

  /**
   * The scale of the particle ( 1 is normal size ).
   */
  public scale = 1;

  /**
   * The mass of the particle ( 1 is the default ).
   */
  public mass = 1;

  /**
   * The radius of the particle, for collision approximation
   */
  public collisionRadius = 1;

  /**
   * The object used to display the image. In a 2D particle, this is usually
   * a DisplayObject. In a 3D particle, this may be a DisplayObject, for
   * displaying on a billboard or similar, or a 3D object in the form used
   * by the render system.
   */
  //  public image:* = null;

  /**
   * The lifetime of the particle, in seconds.
   */
  public lifetime = 0;
  /**
   * The age of the particle, in seconds.
   */
  public age = 0;
  /**
   * The energy of the particle.
   */
  public energy = 1;

  /**
   * Whether the particle is dead and should be removed from the stage.
   */
  public isDead = false;

  /**
   * The dictionary object enables actions and activities to add additional properties to the particle.
   * Any object adding properties to the particle should use a reference to itself as the dictionary
   * key, thus ensuring it doesn't clash with other object's properties. If multiple properties are
   * needed, the dictionary value can be an object with a number of properties.
   */
  //  public get dictionary(): Dictionary
  //  {
  //      if( _dictionary == null )
  //      {
  //          _dictionary = new Dictionary( true );
  //      }
  //      return _dictionary;
  //  }
  //  private _dictionary:Dictionary = null;

  /**
   * Creates a particle. Alternatively particles can be reused by using the ParticleCreator to create
   * and manage them. Usually the emitter will create the particles and the user doesn't need
   * to create them.
   */
  constructor() {
    this._previousColor = this.color;
  }

  /**
   * Sets the particle's properties to their default values.
   */
  public initialize(): void {
    this.color = "#ffffff";
    this.scale = 1;
    this.mass = 1;
    this.collisionRadius = 1;
    this.lifetime = 0;
    this.age = 0;
    this.energy = 1;
    this.isDead = false;

    //  image = null;
    //  _dictionary = null;
    //  _colorTransform = null;
  }

  /**
   * A ColorTransform object that converts white to the colour of the particle.
   */
  //  public get colorTransform():ColorTransform
  //  {
  //      if( !_colorTransform || _previousColor != color )
  //      {
  //          _colorTransform = new ColorTransform( ( ( color >>> 16 ) & 255 ) / 255,
  //                                 ( ( color >>> 8 ) & 255 ) / 255,
  //                                 ( ( color ) & 255 ) / 255,
  //                                 ( ( color >>> 24 ) & 255 ) / 255,
  //                                 0,0,0,0 );
  //          _previousColor = color;
  //      }
  //      return _colorTransform;
  //  }

  // public get alpha(): number {
  //     return ((this.color & 0xFF000000) >>> 24) / 255;
  // }

  /**
   * @private
   */
  protected cloneInto(p: Particle): Particle {
    p.color = this.color;
    p.scale = this.scale;
    p.mass = this.mass;
    p.collisionRadius = this.collisionRadius;
    p.lifetime = this.lifetime;
    p.age = this.age;
    p.energy = this.energy;
    p.isDead = this.isDead;
    //  p.image = image;
    //  if( _dictionary )
    //  {
    //      p._dictionary = new Dictionary( true );
    //      for( key:Object in _dictionary )
    //      {
    //          p._dictionary[ key ] = _dictionary[ key ];
    //      }
    //  }
    return p;
  }

  /**
   * Creates a new particle with all the same properties as this one.
   *
   * <p>Note that the new particle will use the same image object as the one you're cloning.
   * This is fine if the particles are used with a Bitmaprenderer, but if they are used with a
   * DisplayObjectRenderer you will need to replace teh image property with a new image, otherwise
   * only one of the particles (original or clone) will be displayed.</p>
   */
  public clone(): Particle {
    return this.cloneInto(new Particle());
  }

  public revive(): void {
    this.lifetime = 0;
    this.age = 0;
    this.energy = 1;
    this.isDead = false;
  }
}
