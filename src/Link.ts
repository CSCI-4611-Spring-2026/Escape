/** CSci-4611 Example Code
 * Copyright 2023+ Regents of the University of Minnesota
 * Please do not distribute beyond the CSci-4611 course
 * 
 * This example created by Prof. Evan Suma Rosenberg
 */

import * as gfx from 'gophergfx'

export class Link extends gfx.Node3
{
    public morphAlpha: number;
    private targetMesh = "2";
    public startPos = new gfx.Vector3(0,0,0);
    public targetPos = new gfx.Vector3(0, 0.5, 1);
    public character : gfx.Node3;

    constructor(startPos : gfx.Vector3)
    {
        super();

        this.startPos = startPos;
        this.targetPos = gfx.Vector3.add(startPos, this.targetPos);

        this.morphAlpha = 0;

        this.character = new gfx.Node3();
        this.add(this.character);
        this.update(0.1);

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkBody1.obj', 
            './assets/Link/LinkBody' + this.targetMesh + '.obj', 
            './assets/Link/LinkBody.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkEquipment1.obj', 
            './assets/Link/LinkEquipment' + this.targetMesh + '.obj', 
            './assets/Link/LinkEquipment.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkEyes1.obj', 
            './assets/Link/LinkEyes' + this.targetMesh + '.obj', 
            './assets/Link/LinkEyes.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkFace1.obj', 
            './assets/Link/LinkFace' + this.targetMesh + '.obj', 
            './assets/Link/LinkSkin.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkHair1.obj', 
            './assets/Link/LinkHair' + this.targetMesh + '.obj', 
            './assets/Link/LinkBody.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkHands1.obj', 
            './assets/Link/LinkHands' + this.targetMesh + '.obj', 
            './assets/Link/LinkSkin.png'
        ));

        this.character.add(this.loadMorphMesh(
            './assets/Link/LinkMouth1.obj', 
            './assets/Link/LinkMouth' + this.targetMesh + '.obj', 
            './assets/Link/LinkBody.png'
        ));
    }

    public update(deltaTime : number) {
        const jumpPosition = this.targetPos;
        this.character.position.lerp(this.startPos, jumpPosition, this.morphAlpha);
    }

    private loadMorphMesh(meshFile1: string, meshFile2: string, textureFile: string): gfx.MorphMesh
    {
        // Create morph mesh
        const morphMesh = new gfx.MorphMesh3();

        morphMesh.material.side = gfx.Side.DOUBLE;

        gfx.MeshLoader.loadOBJ(meshFile1, (loadedMesh: gfx.Mesh3)=>{
            morphMesh.positionBuffer = loadedMesh.positionBuffer;
            morphMesh.normalBuffer = loadedMesh.normalBuffer;
            morphMesh.texCoordBuffer = loadedMesh.texCoordBuffer;
            morphMesh.colorBuffer = loadedMesh.colorBuffer;
            morphMesh.indexBuffer = loadedMesh.indexBuffer;
            morphMesh.vertexCount = loadedMesh.vertexCount;
            morphMesh.triangleCount = loadedMesh.triangleCount;
        });

        // Load and copy buffer data from the second mesh into the morph buffers
        gfx.MeshLoader.loadOBJ(meshFile2, (loadedMesh: gfx.Mesh3)=>{
            morphMesh.morphTargetPositionBuffer = loadedMesh.positionBuffer;
            morphMesh.morphTargetNormalBuffer = loadedMesh.normalBuffer;
        });

        // Load the texture and assign it to the material
        morphMesh.material.texture = new gfx.Texture(textureFile);

        return morphMesh;
    }
}