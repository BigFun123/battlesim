import { PhysicsAggregate, PhysicsShapeType, SceneLoader, Texture } from "@babylonjs/core";
import { Bus } from "./Bus";
import { IMesh } from "./IMesh";

export class CTerrain extends IMesh {
    constructor(scene) {
        super(scene);
    }

    /**
     * load a texture and only set it once loaded
     */
    async setupTextures(RES) {
        super.setupTextures();
        // PBR material
        let texname = "/assets/" + (RES == "HI" ? this.assetDefinition.texture_hi : this.assetDefinition.texture_lo);
        
        const texture = new Texture(texname, this.scene);
        texture.onLoadObservable.add(() => {
            
            if (texture.loadingError) {
                console.log("Error loading texture", texture.loadingError);
            }
            console.log("finished loading texture", texname);
            this.mesh.material.albedoTexture = texture;
        });
    }

    async setupPhysics() {
        super.setupPhysics();

        //todo:L allow multiple meshes
        this.aggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, 
            friction: this.assetDefinition.friction || 0.1, 
            restitution: this.assetDefinition.restitution || 0.1 }, this.scene);
    }

    async load(asset) {
        const data = await super.load(asset);

        for (let i = 0; i < data.meshes.length; i++) {
            let mesh = data.meshes[i];
            if (mesh.name == "__root__") {
                mesh.isVisible = false;
                continue;
            };
            this.mesh = mesh;
            if (mesh.name == "Collision") {
                this.mesh.isVisible = false;
                this.mesh.isPickable = false;
                this.mesh.checkCollisions = true;
                this.mesh.receiveShadows = false;
            } else {
                mesh.isVisible = true;
                mesh.isPickable = false;
                mesh.checkCollisions = true;
                mesh.receiveShadows = true;
            }
        };
        return data;
        //this.setupPhysics();    
        //this.loadTexture(asset);
    };

    /*
    
    return new Promise((resolve, reject) => {
        SceneLoader.ImportMeshAsync("", "/assets/", asset.file, this.scene, (progress)=> {
            //console.log(asset.file, progress);    
            Bus.send(EVT_PROGRESS, {text: asset.file, progress: progress.loaded/progress.total*100});
        }).then((result) => {
            this.fileContents = result;
            this.mesh = result.meshes[0];

            this.fileContents.meshes.forEach((mesh) => {
                if (mesh) {
                    if (mesh.name === "Collision") {
                        this.mesh = mesh;
                        this.mesh.isVisible = false;
                        const ground = new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0.4, friction: 0.5 }, this.scene);
                        this.aggregate = ground;
                        this.aggregate.body.setCollisionCallbackEnabled(true);    
                        //this.aggregate.body.setEventMask(PhysicsEventType.COLLISION_STARTED);  
                          
                        //this.aggregate.shape.isTrigger = true;
                        //this.aggregate.shape.filterCollideMask = GROUP_PLAYER;
                        //this.aggregate.shape.filterMembershipMask = GROUP_PLAYER;  
                        this.aggregate.transformNode.nameFile = asset.file;
                    }

                    else {
                        mesh.isVisible = true;
                        mesh.isPickable = false;
                        mesh.checkCollisions = false;
                        mesh.receiveShadows = true;
                    }
                }
            })
            resolve();

        });
    })*/
}