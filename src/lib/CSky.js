import { Color3, CubeTexture, MeshBuilder, Scene, StandardMaterial, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { Bus, EVT_FOG, EVT_SETSTATE } from "./Bus";
import { WaterMaterial } from "@babylonjs/materials";
import { STATE_GAME } from "./Constants";

export class CSky {
    // Skybox
    constructor(scene) {
        this.scene = scene;
        Bus.subscribe(EVT_SETSTATE, (state) => {
            this.skybox.isVisible = state === STATE_GAME;
        });
        Bus.subscribe(EVT_FOG, (state) => {
            this.setupFog(state);
        });

        this.setupSky();
        this.setupFog();
    }

    setupSky() {
        //let skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
        var hdrTexture = new CubeTexture("assets/sky/TropicalSunnyDay", this.scene);

        let skybox = this.scene.createDefaultSkybox(hdrTexture, true, 20000);

        skybox.isPickable = false;
        skybox.enableCollisions = false;
        skybox.enablePhysics = false;
        skybox.isVisible = false;
        skybox.groundColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);
        skybox.diffuseColor = new Color3(0.011764705882352941, 0.1803921568627451, 0.5529411764705883);

        

        /*var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new CubeTexture("assets/sky/skybox", scene);
        //skyboxMaterial.reflectionTexture = new HDRCubeTexture("/assets/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;*/
        skybox.receiveShadows = false;
        skybox.isBlocker = false;
        skybox.isBlockerMesh = false;
        skybox.isPickable = false;
        this.skybox = skybox;

        /*
         // Water
         var waterMesh = MeshBuilder.CreateGround("waterMesh", {width: 4024, height: 4024, subdivisions:16}, this.scene );
         var water = new WaterMaterial("water", this.scene, new Vector2(512, 512));
         waterMesh.position = new Vector3(-300, 0, -2950);
         water.backFaceCulling = true;
         water.bumpTexture = new Texture("/assets/art/waterbump.png", this.scene);
         water.windForce = -10;
         water.waveHeight = 1.7;
         water.bumpHeight = 0.1;
         water.windDirection = new Vector2(1, 1);
         water.waterColor = new Color3(0, 0, 221 / 255);
         water.colorBlendFactor = 0.0;
         water.addToRenderList(skybox);
         waterMesh.material = water;
        
        
        */
        

        Bus.subscribe("player", this.update.bind(this));
    }

    setupFog(state) {
        if (state && state.mode == "none") {
            this.scene.fogMode = Scene.FOGMODE_NONE;
            
        } else {
            this.scene.fogMode = Scene.FOGMODE_EXP;
        }
        
        this.scene.fogDensity = 0.00015;
        this.scene.fogStart = 120.0;
        this.scene.fogEnd = 800.0;

        // cool effect, make these  > 1
        this.scene.fogColor = new Color3(98/200, 161/255, 235/255);
    }

    update(player) {
        if (this.skybox) {
            this.skybox.position = player.position.clone();
        }

    }
}