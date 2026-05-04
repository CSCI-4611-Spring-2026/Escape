import * as gfx from 'gophergfx'

/** 
 * Creates a scene graph Node3 to draw an arrow.  The base of the arrow is located
 * at Arrow.position and the length and direction of the arrow are based on
 * Arrow.vector.  Example:
 * ```
 *   const arrow = new Arrow(gfx.Color.YELLOW);
 *   this.scene.add(arrow);
 *   arrow.position = new gfx.Vector3(1, 0, 0);
 *   arrow.vector = new gfx.Vector3(1, 1, 1);
 * ```
 */
export class Character extends gfx.Node3 {

    public mesh : gfx.Mesh3;
    private walkTexture : gfx.Texture;
    private jumpTexture : gfx.Texture;
    private acceleration : gfx.Vector3 = new gfx.Vector3(0,-10,0);
    private velocity : gfx.Vector3;
    private moving : boolean = false;

    constructor(mesh : gfx.Mesh3, walkTexture : gfx.Texture, jumpTexture : gfx.Texture)
    {
        super();
        
        this.mesh = mesh;
        this.mesh.material
        this.add(mesh);
        this.mesh.material = new gfx.PhongMaterial();
        this.walkTexture = walkTexture;
        this.jumpTexture = jumpTexture;
        this.mesh.material.texture = this.walkTexture;
        this.mesh.material.side = gfx.Side.DOUBLE;
        this.reset();
    }

    public update(deltaTime : number) {
        if (this.moving) {
            this.velocity.add(gfx.Vector3.multiplyScalar(this.acceleration, deltaTime));
            this.position.add(gfx.Vector3.multiplyScalar(this.velocity, deltaTime));
        }

        if (this.position.y < -10.0) {
            this.reset();
        }
    }

    public move(dx : number, deltaTime : number) {
        this.position.x += dx * deltaTime;
        this.mesh.material.texture = this.walkTexture;
        this.scale.x = Math.sign(dx);

        this.moving = true;
    }

    public jump() {
        this.moving = true;
        this.mesh.material.texture = this.jumpTexture;
    }

    private reset() {
        this.moving = false;
        this.position = new gfx.Vector3(-0.75, 0, 0);
        this.velocity = new gfx.Vector3(0,0,0);
    }
}
