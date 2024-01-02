import { Color3, MeshBuilder, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, StandardMaterial } from "@babylonjs/core";
import { Bus, EVT_PROGRESS } from "../Bus";

export class CBullet {
    timerid;
    lifespan = 1000;
    bulletpool = [];
    bullets = [];
    bulletSpeed = -3000;  // plane axis is x-
    bulletMaterial;
    constructor(ownerMesh, scene) {
        this.scene = scene;
        this.owner = ownerMesh;


        // create glowing bullet material
        this.bulletMaterial = new StandardMaterial("bulletMaterial", this.scene);
        this.bulletMaterial.diffuseColor = new Color3(1, 0, 0);
        this.bulletMaterial.emissiveColor = new Color3(1, 0, 0);
        this.bulletMaterial.specularColor = new Color3(1, 0, 0);
        this.bulletMaterial.alpha = 0.9;
        this.bulletMaterial.disableLighting = true;
        this.bulletMaterial.backFaceCulling = false;



        scene.onBeforePhysicsObservable.add(() => {
            this.bullets.forEach((bullet) => {
                //bullet.aggregate.transformNode.position = bullet.aggregate.transformNode.position.add(bullet.aggregate.transformNode.forward.scale(-15));
                bullet.lifespan--;
                if (bullet.lifespan < 0) {                    
                    //remove bullet from bullets
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                    bullet.aggregate.dispose();
                    bullet.dispose();
                    //bullet.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
                    // save for later reuse
                    //this.bulletpool.push(bullet);
                }
            });
        });
    }

    bulletCollision(bullet, mesh) {
        //Bus.send("bullet-collision", { bullet: bullet, mesh: mesh });
        Bus.send(EVT_PROGRESS, { text: "bullet collision", progress: 99 });
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
        bullet.dispose();
    }

    fireBullet() {
        const bullet = MeshBuilder.CreateBox("bullet", { width: 0.2, height: .2, depth: 3.1 }, this.scene);
        bullet.material = this.bulletMaterial;
        bullet.position = this.owner.position.add(this.owner.forward.scale(-40));
        bullet.rotationQuaternion = this.owner.rotationQuaternion.clone();
        bullet.aggregate = new PhysicsAggregate(bullet, PhysicsShapeType.BOX, { mass: 0.01, friction: 0.15, restitution: 0.2 }, this.scene);
        bullet.aggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        bullet.aggregate.body.setLinearVelocity(this.owner.forward.scale(this.bulletSpeed));
        
        // enable collision events on the body
        bullet.aggregate.body.setCollisionCallbackEnabled(true);


        



        bullet.aggregate.body.disablePreStep = false;
        this.bullets.push(bullet);
        // add a collision callback
        bullet.aggregate.onCollideEvent = (collider, collidedWith) => {
            this.bulletCollision(bullet, collidedWith);
        };
    }
}