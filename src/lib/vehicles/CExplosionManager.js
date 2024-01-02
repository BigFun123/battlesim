import { Sprite, SpriteManager, Vector3 } from "@babylonjs/core";
import { Bus } from "../Bus";

export class CExplosionManager {
    static spriteManager;
    static explosion;
    constructor(scene) {
        this.scene = scene;        
        CExplosionManager.spriteManager = new SpriteManager("explosion", "/assets/fx/explosion.png", 1000, 200, this.scene);
        CExplosionManager.spriteManager.renderingGroupId = 1;
        CExplosionManager.explosion = new Sprite("explosion", CExplosionManager.spriteManager);
        CExplosionManager.explosion.size = 120;
    }

    static explode(location) {
        // create a 2d sprite animation at the location

        //spriteManager.blendMode = SpriteManager.BLENDMODE_ONEONE;
        
        //this.explosion.color.a = 0.95;

        CExplosionManager.explosion.position = location.add(new Vector3(0, 1.5, 0));        
        CExplosionManager.explosion.playAnimation(0, 36, false, 100, () => {});

        // create a sound at the location
        //Bus.send("play-3daudio", { name: "massive-thump-116359.mp3", mesh: this.explosion, volume: 0.70 });
        //const sound = new Sound("explosion", "/assets/sounds/explosion.wav", this.scene, () => {
        //  sound.play();
        //});

        // create a particle system at the location
        /*const particleSystem = new ParticleSystem("explosion", 2000, this.scene);
        particleSystem.particleTexture = new Texture("/assets/fx/flare.png", this.scene);
        particleSystem.emitter = this.location;
        particleSystem.minEmitBox = new Vector3(-1, 0, -1);
        particleSystem.maxEmitBox = new Vector3(1, 0, 1);
        particleSystem.color1 = new Color4(1, 0.5, 0, 1);0
        particleSystem.color2 = new Color4(1, 0.5, 0, 1);
        particleSystem.colorDead = new Color4(0, 0, 0, 0);
        particleSystem.minSize = 0.3;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.5;
        particleSystem.emitRate = 1000;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new Vector3(0, 0, 0);
        particleSystem.direction1 = new Vector3(-1, 8, 1);
        particleSystem.direction2 = new Vector3(1, 8, -1);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;
        particleSystem.start();*/

    }
}