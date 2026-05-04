

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { Arrow } from './Arrow'
import { MyPhongMaterial } from './MyPhongMaterial';
import { escape_create, escape_update, escape_on_key, escape_click_on_scene, escape_on_mouse } from './escape.js'; 
import { Character } from './Character';
import { Link } from './Link';

export class App extends gfx.GfxApp
{
    protected readonly gl: WebGL2RenderingContext;

    // State variables
    private currentTime: number;

    // GUI variables
    public gui: GUI;
    public showHint1: boolean;
    public showHint2: boolean;
    public displayMode: string;

    public object : gfx.Mesh3;
    public texture : gfx.Texture;
    public text : gfx.Mesh2;
    public text2 : gfx.Mesh2;
    public switch : gfx.Node3;
    public room : gfx.Node3;
    public lightsOn : boolean = false;
    public character : Character = null;

    public myPhongMaterial : gfx.Material3 = new MyPhongMaterial();
    public objects : gfx.Node3[] = [];
    public meshes : gfx.Mesh3[] = [];
    public link : Link = null;
    public shadowLink : Link = null;
    public morphAlpha : number = 0;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();
        
        this.gl  = this.renderer.gl;

        this.currentTime = Infinity;

        this.gui = new GUI();
        this.showHint1 = false;
        this.showHint2 = false;
        this.displayMode = 'Textured';
    }

    createHints(hint1 : string, hint2 : string) {
        this.text.material.texture = new gfx.Text(hint1,456,64,'20px Helvetica','white');
        this.text.visible = false;
        this.text2.material.texture = new gfx.Text(hint2,456,64,'20px Helvetica','white');
        this.text2.visible = false;
        this.showHint1 = false;
        this.showHint2 = false;
        this.gui.updateDisplay();
    }

    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        this.renderer.viewport = gfx.Viewport.CROP;
        this.renderer.background = gfx.Color.BLUE;

        // Setup camera
        this.camera.setPerspectiveCamera(60, 2, 0.1, 50)
        this.camera.position.set(-.5, 1, 3.25);
        this.camera.lookAt(new gfx.Vector3(0,1.1,0));

        const pointLight = new gfx.PointLight(new gfx.Color(0.2, 0.2, 0.2));
        this.scene.add(pointLight);
        pointLight.position = new gfx.Vector3(1, -1, -0.5);

        // Set the background image
        const background = gfx.Geometry2Factory.createRect(2, 2);
        background.material.texture = new gfx.Texture('./assets/stars.png');
        background.layer = 1;
        //this.scene.add(background);

        this.text = gfx.Geometry2Factory.createRect(0.9, 0.25); 
        
        //this.text.material.color = gfx.Color.WHITE;
        this.text.position.y = 0.75;
        this.text.position.x = 0;
        this.text.visible = false;
        this.scene.add(this.text);
        this.scene.add(this.text);

        this.text2 = gfx.Geometry2Factory.createRect(0.9, 0.25); 
        this.text2.position.y = this.text.position.y-0.15;
        this.text2.position.x = 0;
        this.text2.visible = false;
        this.scene.add(this.text2);


        // Create a new GUI folder to hold earthquake controls
        const controls = this.gui.addFolder('Controls');

        // Create a GUI control for the view mode and add a change event handler
        let hintController = controls.add(this, 'showHint1',  true);
        hintController.name('Show Hint 1');
        hintController.onChange((value: boolean) => { 
            this.text.visible = value;
        });

        hintController = controls.add(this, 'showHint2',  true);
        hintController.name('Show Hint 2');
        hintController.onChange((value: boolean) => { 
            this.text2.visible = value;
        });

        // Make the GUI controls wider and open by default
        this.gui.width = 300;
        controls.open();

        // Add the moon
        this.object = gfx.Geometry3Factory.createSphere(1,4);
        this.object.position.z = -1.5;
        this.object.position.y = 1.5;
        this.object.position.x = 0.25;
        const material = new gfx.PhongMaterial();
        this.object.material = material;
        this.object.scale = new gfx.Vector3(0.65, 0.65, 0.65);
        this.texture = new gfx.Texture('./assets/moon.jpeg');
        this.texture.setMinFilter(true, false); 
        material.texture = this.texture;
        this.scene.add(this.object);

        // Add Link
        this.link = new Link(new gfx.Vector3(0.4,0,1));
        this.link.rotation = gfx.Quaternion.makeRotationY(Math.PI/2.0);
        this.scene.add(this.link );

        // Add Link's shadow
        this.shadowLink = new Link(new gfx.Vector3(0.5,0,1));
        this.shadowLink.rotation = gfx.Quaternion.makeRotationY(Math.PI/2.0);
        this.scene.add(this.shadowLink);
        for(let i=0; i < this.shadowLink.character.children.length; i++) {
            const morphMesh = this.shadowLink.character.children[i] as gfx.MorphMesh3;
            morphMesh.material.setColor(new gfx.Color(0.,0.0,0.0));
        }

        const morphController = controls.add(this, 'morphAlpha', 0, 1);
        morphController.name('Alpha');
        morphController.onChange(() => { 
            this.link.morphAlpha = this.morphAlpha;
            this.shadowLink.morphAlpha = this.morphAlpha;
            for(let i=0; i < this.link.character.children.length; i++)
            {
                const morphMesh = this.link.character.children[i] as gfx.MorphMesh3;
                morphMesh.morphAlpha = this.morphAlpha;
            }

            /*for(let i=0; i < this.shadowLink.character.children.length; i++)
            {
                const morphMesh = this.shadowLink.character.children[i] as gfx.MorphMesh3;
                morphMesh.morphAlpha = this.morphAlpha;
            }*/
        });

        // Add the room
        this.room = gfx.MeshLoader.loadGLTF('./assets/room.glb', (rootNode) => {
            rootNode.children.forEach(child => {
                if (child instanceof gfx.Mesh3) {
                    const mesh = child;
                    mesh.material = new gfx.PhongMaterial();
                    mesh.material.setColor(new gfx.Color(0.5, 0.5, 0.5));
                    this.meshes.push(mesh);
                }
                
            });
        });
        this.room.scale = new gfx.Vector3(2.0,2.0,2.0);
        this.room.rotation = gfx.Quaternion.makeRotationY(-Math.PI/2.0);
        this.objects.push(this.room);
        this.scene.add(this.room);

        // Add the switch
        this.switch = gfx.MeshLoader.loadGLTF('./assets/switch.glb', (rootNode) => {
            rootNode.children.forEach(child => {
                if (child instanceof gfx.Mesh3) {
                    const mesh = child;
                    mesh.material = new MyPhongMaterial();
                    this.meshes.push(mesh);
                }
                
            });

        });
        this.objects.push(this.switch);

        const swMat = gfx.Matrix4.IDENTITY.clone();
        swMat.multiply(gfx.Matrix4.makeTranslation(new gfx.Vector3(3.0, 1.5, 0.5)));
        swMat.multiply(gfx.Matrix4.makeEulerAngles(Math.PI/2.0,-Math.PI/2.0,0));
        swMat.multiply(gfx.Matrix4.makeScale(new gfx.Vector3(0.75, 1.0, 1.0)));
        swMat.multiply(gfx.Matrix4.makeScale(new gfx.Vector3(0.25, 0.25, 0.25)));
        this.switch.setLocalToParentMatrix(swMat);
        this.scene.add(this.switch);

        escape_create(this);
    }

    public rotateSphere(center : gfx.Vector3, point : gfx.Vector3, previousPoint : gfx.Vector3) : gfx.Quaternion {
        return new gfx.Quaternion();
    }
    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        if (this.character != null) {
            this.character.update(deltaTime);
        }

        this.link.update(deltaTime);
        //this.shadowLink.update(deltaTime);

        escape_update(this, deltaTime);
    }
    
    onMouseDown(event: MouseEvent): void {
        const screenPt = this.getNormalizedDeviceCoordinates(event.x, event.y);

        // You can loop through this.meshes array if you like 

        // You can call clickOnScene if you know the 3D point you would like to click on
        // this.clickOnScene(point);
       
        escape_on_mouse(this, event, 1);
    }

    onMouseUp(event: MouseEvent): void {
        escape_on_mouse(this, event, 0);
    }

    onMouseMove(event: MouseEvent): void {
        escape_on_mouse(this, event, 2);
    }

    // Click on a 3D point in the scene
    clickOnScene(point : gfx.Vector3) : void {
        escape_click_on_scene(this, point);
    }

    onKeyDown(event: KeyboardEvent): void {
        escape_on_key(this, event, true);
    }

    onKeyUp(event: KeyboardEvent): void {
        escape_on_key(this, event, false);
    }

}
