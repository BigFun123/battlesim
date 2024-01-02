import { Color3, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsMotionType, PhysicsShapeMesh, PhysicsShapeType, Quaternion, StandardMaterial, Texture, TransformNode, Vector3, VertexBuffer } from "@babylonjs/core";
import { Bus, EVT_PLAYERUPDATE, EVT_PROGRESS } from "./Bus";
import { CTools } from "./CTools";
import { CSettings } from "./CSettings";
import { CLighting } from "./CLighting";

const EARTH_CIR_METERS = 40075016.686;
const degreesPerMeter = 360 / EARTH_CIR_METERS;
const STATE_TODO = 0;
const STATE_LOADING = 1;
const STATE_LOADED = 2;
const STATE_PHYSICS = 3;
const STATE_HOUSES = 4;
const STATE_VEGETATION = 5;

export class CMap {
    rootNode;
    tilex = 9028;
    tiley = 9835;
    zoom = 14;
    subdivision = 10;
    numtiles = CSettings.settings.tilesAmount;
    datasource = "/tiles/rgb/";
    detail = "_lo"; // "" or "_lo"
    tiles = {};
    checkCounter = 0;
    anchor = null; // the anchor tile is the world center tile, ie tile at spawn position
    noiseTexture;
    constructor(scene, assetManager, asset) {
        this.scene = scene;
        this.assetManager = assetManager;
        this.asset = asset;
        this.zoom = asset.ztile;
        this.tileX = asset.xtile;
        this.tileY = asset.ytile;
        // store anchor tile position
        this.anchor = this.getBounds(asset.xtile, asset.ytile, asset.ztile);

        Bus.subscribe(EVT_PLAYERUPDATE, (data) => {
            this.update(data);
        });

        this.createRootNode();
        this.loadNoiseTexture();
        this.loadTilesAround(asset.xtile, asset.ytile, this.zoom);
    }

    createRootNode() {
        //create a new transform
        const transformNode = new TransformNode("map", this.scene);
        this.rootNode = transformNode;
        this.rootNode.position = new Vector3(0, 0, 0);
    }

    loadNoiseTexture() {
        const noiseTexture = new Texture("/assets/textures/Gravel.jpg", this.scene);
        this.noiseTexture = noiseTexture;
        noiseTexture.onLoadObservable.add(() => {
            noiseTexture.uScale = 10;
            noiseTexture.vScale = 10;
            //noiseTexture.vScale = 1;
            noiseTexture.hasAlpha = false;
            noiseTexture.wrapU = Texture.WRAP_ADDRESSMODE;
            noiseTexture.wrapV = Texture.WRAP_ADDRESSMODE;
            //noiseTexture.anisotropicFilteringLevel = 1;
            noiseTexture.level = 2;
            //noiseTexture.wrap = false;            
        });
    }

    createTileDef(xtile, ytile, zoom) {
       // console.log("tile:", xtile, ytile);
        //const bounds = this.getBounds(xtile, ytile, zoom);
        this.tiles[xtile + "_" + ytile] = { x: xtile, y: ytile, z: zoom, state: STATE_TODO, physics: "required", initialized: false, stitched: false };
    }

    loadTilesAround(xtile, ytile, zoom) {
        let xt = 0;
        let yt;
        for (xt = -this.numtiles; xt < this.numtiles; xt++) {
            for (yt = -this.numtiles; yt < this.numtiles; yt++) {
                const xx = (xtile + xt);
                const yy = (ytile + yt);
                this.createTileDef(xx, yy, zoom);
                Bus.send(EVT_PROGRESS, { text: "Loading tile " + xx + "_" + yy, progress: 0 });
                //this.loadTile(asset.xtile + xt, asset.ytile + yt);
                this.loadHeightTile(xx, yy);
            }
        }
    }

    stitch(xtile, ytile) {
        // make the y position of each vertex on the edge match the y vertex of existing tiles
        // find the tile to the left and right of the tile
        const tile = this.getTile(xtile, ytile);
        if (!tile) return;
        if (tile.stitched) return;
        tile.stitched = true;
        const left = this.getTile(xtile - 1, ytile);
        const right = this.getTile(xtile + 1, ytile);
        const top = this.getTile(xtile, ytile - 1);
        const bottom = this.getTile(xtile, ytile + 1);
        //if (!left || !right || !top || !bottom) return;

        const mesh = tile.mesh;
        const vertices = mesh.getVerticesData(VertexBuffer.PositionKind);
        const indices = mesh.getIndices();

        if (left && left.mesh) {
            const leftMesh = left.mesh;
            const leftVertices = leftMesh.getVerticesData(VertexBuffer.PositionKind);
            const leftIndices = leftMesh.getIndices();

            // stitch the left edge
            let i = 0;
            for (let y = 0; y < this.leftVertices / 3; y++) {
                const xi = leftVertices[y * 3 + 0];
                const yi = leftVertices[y * 3 + 1];
                const zi = leftVertices[y * 3 + 2];
                vertices[y * 3 + 1] = yi;
                i++;
            }

            mesh.updateVerticesData(VertexBuffer.PositionKind, vertices);

            mesh.updateVerticesData(VertexBuffer.ColorKind, vertices);
        }

        /* if (right && right.mesh) {
             const rightMesh = right.mesh;
             const rightVertices = rightMesh.getVerticesData(VertexBuffer.PositionKind);
             const rightIndices = rightMesh.getIndices();
 
             // stitch the right edge
             let i = 0;
             for (let y = 0; y < this.subdivision; y++) {
                 const index = y * (this.subdivision + 1) + this.subdivision;
                 vertices[index] = rightVertices[index - this.subdivision] + 10;
                 i++;
             }
 
             mesh.updateVerticesData(VertexBuffer.PositionKind, vertices);
         }*/

    }

    // TODO, do this every 1000 calls or so
    update(player) {
        this.checkCounter++;
        if (this.checkCounter < 10) return;
        this.checkCounter = 0;
        const tile = this.findTileUnderPlayer(player);
        if (!tile) {
            //tile = this.createTileDef(xx, yy, zoom);
            // todo get tiledef under player
            ///this.tiles[xx + "_" + yy] = { x: xx, y: yy, state: STATE_TODO, physics: "required", initialized: false };
            //this.createTileDef(tile.xtile, tile.ytile, zoom);                    
            //this.loadHeightTile(xx, yy);
            return;
        };
        const xtile = tile.x;
        const ytile = tile.y;

        // check if the 9 surrounding tiles are loaded
        for (let xt = -this.numtiles; xt < this.numtiles; xt++) {
            for (let yt = -this.numtiles; yt < this.numtiles; yt++) {
                const xx = (xtile + xt);
                const yy = (ytile + yt);
                const key = xx + "_" + yy;
                const tile = this.tiles[key];
                if (!tile) {
                    //this.tiles[xx + "_" + yy] = { x: xx, y: yy, state: STATE_TODO, physics: "required", initialized: false };
                    this.createTileDef(xx, yy, this.zoom);
                    this.loadHeightTile(xx, yy);
                    //this.assetManager.loadAsync();
                }
            }
        }
    }

    findTileUnderPlayer(player) {
        // iterate through the  tiles object members
        for (const key in this.tiles) {
            if (this.tiles.hasOwnProperty(key)) {
                const tile = this.tiles[key];
                if (tile.state !== STATE_LOADING) {
                    const pr = player.position.clone();
                    pr.y = tile.mesh?.boundingInfo?.boundingBox.centerWorld.y || 0;
                    if (tile.mesh && tile.mesh.intersectsPoint(pr)) {
                        return tile;
                    }
                }
            }
        }
    }

    getTile(x, y) {
        return this.tiles[x + "_" + y];
    }

    // create a HeightManp from a texture
    async loadHeightTile(x, y, addphyiscs, quality) {

        const tile = this.getTile(x, y);
        if (tile.state !== STATE_TODO) {
            return;
        }
        Bus.send(EVT_PROGRESS, { text: "Loading tile " + x + "_" + y, progress: 50 });
        const bounds = this.getBounds(x, y, this.zoom);
        const mesh = MeshBuilder.CreateGroundFromHeightMap("tile_" + x + "_" + y, "/tiles/depth/" + this.zoom + "/" + x + "/" + y + ".png",
            {
                width: 10,
                height: 10,
                subdivisions: this.subdivision,
                maxHeight: 100,
                updatable: true,
                onReady: (mesh) => {
                    mesh.parent = this.rootNode;
                    tile.mesh = mesh;
                    tile.state = STATE_LOADED;

                    //Bus.send(EVT_PROGRESS, { text: "Stitching tile " + x + "_" + y, progress: 75 });
                    //this.stitch(x, y);

                    CLighting.shadowGenerator.addShadowCaster(mesh, true);                            
                    mesh.receiveShadows = true;
                    Bus.send(EVT_PROGRESS, { text: "Loading tile " + x + "_" + y, progress: 75 });

                    mesh.position.x = (bounds.x - this.anchor.x);
                    mesh.position.y = -100;

                    mesh.position.z = (bounds.z - this.anchor.z);
                    mesh.scaling.x = bounds.width / 10 + 0.01;
                    mesh.scaling.y = 80;
                    mesh.scaling.z = bounds.length / 10 + 0.01;

                    // add physics
                    var groundShape = new PhysicsShapeMesh(mesh, this.scene);
                    var groundBody = new PhysicsBody(mesh, PhysicsMotionType.STATIC, false, this.scene);
                    var groundMaterial = { friction: 0.2, restitution: 0.3 };
                    tile.state = STATE_PHYSICS;

                    groundShape.material = (groundMaterial);
                    groundBody.shape = (groundShape);
                    groundBody.setMassProperties({
                        mass: 0,
                    });
                    mesh.tileBounds = bounds;
                    mesh.boundingInfo = mesh.getBoundingInfo();


                    return this.loadTexture(x, y, mesh);
                },
                onError: (msg, exception) => {
                    console.log("error loading heightmap " + msg, exception);
                    Bus.send(EVT_PROGRESS, { text: "Error Loading tile " + x + "_" + y, progress: 0 });
                }

            },

            this.scene);

        mesh.metadata = bounds;



    }

    /*setupPhysics() {
        // iterate over the tile object members
        for (const key in this.tiles) {
            if (this.tiles.hasOwnProperty(key)) {
                const tile = this.tiles[key];
                if (tile.physics == "required") {
                    this.setupPhysicsTile(tile.x, tile.y);
                }
            }
        }
    }

    setupPhysicsTile(x, y) {
        const tile = this.getTile(x,y);
        if (tile.physics == "required") {
            const mesh = tile.mesh;
            Bus.send(EVT_PROGRESS, { text: "Tile Physics " + x + "_" + y, progress: 50 });        
            // create a havok physics aggreg4121ate for terrain
            const ground = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0, restitution: 0.4, friction: 0.1 }, this.scene);            
            ground.body.disablePreStep = true;
            ground.transformNode.position = mesh.position;
            tile.state="physics";
            tile.aggregate = ground;
            mesh.position.y = 0;
            mesh.checkCollisions = false;
            mesh.isPickable = false;
            mesh.isVisible = true;
           // mesh.freezeWorldMatrix();
            //mesh.freezeNormals();
            //mesh.freezeNormals();
            //mesh.freezeWorldMatrix();
        };
    }
*/

    /*loadGLTFTile(x, y) {
        // load gltf tile from assetmanager        
        //console.log("loading tile " + x + "_" + y + ".glb");

        const tileTask = this.assetManager.addMeshTask("tile", "", "/tiles/gltf/" + this.zoom + "/" + x + "/", y + this.detail + ".glb");
        tileTask.data = { x: x, y: y };
        tileTask.onSuccess = (task) => {
            task.loadedMeshes.forEach((mesh) => {
                //mesh.position.x = this.asset.xtile * this.tilex;
                //mesh.position.z = this.asset.ytile * this.tiley;
                //mesh.position.y = 0;
                //mesh.scaling.x = 1;
                //mesh.scaling.y = 1;
                //mesh.scaling.z = 1;
                if (mesh.name == "__root__") {
                    mesh.isVisible = false;
                    //mesh.rotationQuaternion = Quaternion.Identity();
                    const bounds = this.getBounds(tileTask.data.x, tileTask.data.y, this.zoom);
                    mesh.position.x = -(bounds.x - this.anchor.x);
                    mesh.position.z = -(bounds.z - this.anchor.z);
                } else {
                    mesh.checkCollisions = false;
                    mesh.receiveShadows = true;
                    mesh.isPickable = false;
                    mesh.isVisible = true;
                    //mesh.parent = this.scene;                
                    this.loadTexture(x, y, mesh);
                }

            });
        };
        tileTask.onError = (task, message, exception) => {
            console.log(message, exception);
        };



    }*/

    async loadTexture(x, y, mesh) {

        const texture = new Texture("/tiles/rgb/" + this.zoom + "/" + x + "/" + y + ".jpg", this.scene);
        texture.onLoadObservable.add(() => {
            texture.uScale = 1;
            texture.uScale = 1;
            texture.vScale = 1;
            texture.hasAlpha = false;
            texture.wrapU = Texture.CLAMP_ADDRESSMODE;
            texture.wrapV = Texture.CLAMP_ADDRESSMODE;
            texture.anisotropicFilteringLevel = 1;
            texture.wrap = false;
            const material = new StandardMaterial("tile_" + x + "_" + y, this.scene);
            material.diffuseTexture = texture;
            material.diffuseColor = new Color3(1, 1, 1);
            material.specularColor = new Color3(0, 0, 0);
            material.ambientColor = new Color3(0.5, 0.5, 0.5);
            material.emissiveColor = new Color3(0, 0, 0);
            material.bumpTexture = this.noiseTexture;
            material.bumpTexture.level = 2;     
            material.bumpScale = 2;       
            //material.detailMap = this.noiseTexture;
            //material.detailMap.uScale = 100;
            //material.detailMap.vScale = 100;
            

            material.backFaceCulling = false;
            material.freeze();
            mesh.material = material;
            Bus.send(EVT_PROGRESS, { text: "Loading tile texture " + x + "_" + y, progress: 100 });
            mesh.getChildMeshes().forEach((child) => {
                child.material = material;
            });
        });

        /*
                const textureTask = this.assetManager.addTextureTask("TileTexture_" + x + "_" + y, this.datasource + this.zoom + "/" + x + "/" + y + ".jpg");
                textureTask.onSuccess = (task) => {
                    task.texture.uScale = 1;
                    task.texture.vScale = 1;
                    task.texture.hasAlpha = false;
                    task.texture.wrapU = 1;
                    task.texture.wrapV = 1;
                    task.texture.anisotropicFilteringLevel = 1;
                    const material = new StandardMaterial("tile_" + x + "_" + y, this.scene);
                    material.diffuseTexture = task.texture;
                    material.specularColor = new Color3(0, 0, 0);
                    material.ambientColor = new Color3(1, 1, 1);
                    material.emissiveColor = new Color3(0, 0, 0);
                    material.backFaceCulling = false;
                    material.freeze();
                    mesh.material = material;
                    Bus.send(EVT_PROGRESS, { text: "Loading tile texture " + x + "_" + y, progress: 100 });
        
                    mesh.getChildMeshes().forEach((child) => {
                        child.material = material;
                    });
                };
                */
        // textureTask.run(this.scene, () => {
        //   console.log("texture " + x + "_" + y + ".jpg");
        //}, () => {
        //  console.error("failed to load and apply texture " + x + "_" + y + ".jpg")
        //});
        //return textureTask;
    }


    getBounds(xtile, ytile, zoom) {

        // calculate bounds of tile in degrees
        let south_edge = this.tile2lat(ytile + 1, zoom);
        let north_edge = this.tile2lat(ytile, zoom);
        let west_edge = this.tile2long(xtile, zoom);
        let east_edge = this.tile2long(xtile + 1, zoom);

        // calculate center of tile in degrees
        let center_lat = (south_edge + north_edge) / 2;
        let center_lng = (west_edge + east_edge) / 2;

        // calculate bounds of tile in degrees
        let bounds = this.latLngToBounds(center_lat, center_lng, zoom, 512, 512);
        bounds.xtile = xtile;
        bounds.ytile = ytile;
        bounds.zoom = zoom;

        console.log(bounds);
        return bounds;
    }

    latLngToBounds(lat, lng, zoom, width, height) { // width and height must correspond to the iframe width/height
        const metersPerPixelEW = EARTH_CIR_METERS / Math.pow(2, zoom + 8);
        const metersPerPixelNS = EARTH_CIR_METERS / Math.pow(2, zoom + 8) * Math.cos(this.toRadians(lat));

        const shiftMetersEW = width / 2 * metersPerPixelEW;
        const shiftMetersNS = height / 2 * metersPerPixelNS;

        const shiftDegreesEW = shiftMetersEW * degreesPerMeter;
        const shiftDegreesNS = shiftMetersNS * degreesPerMeter;

        // get left corner of geo tile in meters

        const topleftInMeters = {
            x: lng * EARTH_CIR_METERS / 360,
            y: lat * EARTH_CIR_METERS / 360
        }
        const bottomRightInMeters = {
            x: (lng + 1) * EARTH_CIR_METERS / 360,
            y: (lat - 1) * EARTH_CIR_METERS / 360
        }



        return {
            crs: "EPSG:4326",
            north: lat + shiftDegreesNS,
            east: lng + shiftDegreesEW,
            south: lat - shiftDegreesNS,
            west: lng - shiftDegreesEW,
            sizexm: shiftMetersEW,
            sizeym: 10000,
            sizezm: shiftMetersNS,
            x: topleftInMeters.x,
            y: 0,
            z: topleftInMeters.y,
            x2: topleftInMeters.x + shiftMetersEW,
            y2: topleftInMeters.y - shiftMetersNS,
            width: shiftMetersEW,
            length: shiftMetersNS,
            height: 10000
        }
    }

    lon2tile(lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }
    lat2tile(lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))); }

    tile2long(x, z) {
        return (x / Math.pow(2, z) * 360 - 180);
    }
    tile2lat(y, z) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    toRadians(degrees) {
        return degrees * Math.PI / 180;
    };




}