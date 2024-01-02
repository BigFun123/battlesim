import { Color3, Mesh, MeshBuilder, Texture, Vector2 } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";

export class COcean {
    constructor(scene, position) {
        this.scene = scene;

    }

    setup(asset) {

        // Water
        var waterMesh = MeshBuilder.CreateGround("waterMesh", {width: 1024, height: 1024, subdivisions:16}, this.scene );
        var water = new WaterMaterial("water", this.scene, new Vector2(512, 512));
        water.backFaceCulling = true;
        water.bumpTexture = new Texture("/assets/art/waterbump.png", this.scene);
        water.windForce = -10;
        water.waveHeight = 1.7;
        water.bumpHeight = 0.1;
        water.windDirection = new Vector2(1, 1);
        water.waterColor = new Color3(0, 0, 221 / 255);
        water.colorBlendFactor = 0.0;
        //water.addToRenderList(skybox);
        waterMesh.material = water;
    }

    /*
        // Create a built-in "ground" shape.
        const ground = MeshBuilder.CreateGround("ground",
            { width: 2, height: 2, subdivisions: 128 }, this.ActiveXObjectscene);
        ground.position.y = -50;
 
        //NodeMaterial.ParseFromSnippetAsync("#3FU5FG#1", scene).then((mat) => {
        NodeMaterial.ParseFromFileAsync("ocean", "/assets/oceanMaterial.json", this.scene).then((mat) => {
            ground.material = mat;
            ground.scaling = new Vector3(asset.position.x, asset.position.y, asset.position.z);
            window.mat = mat;
        });
    }*/
}