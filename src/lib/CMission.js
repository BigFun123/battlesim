import { AssetsManager } from "@babylonjs/core";
import { Bus, EVT_SETPLAYER, EVT_LOADMISSION, EVT_SETSTATE, EVT_PROGRESS, EVT_FOG } from "./Bus";
import { CAircraft } from "./CAircraft";
import { CNPC } from "./CNPC";
import { COcean } from "./COcean";
import { CPlayer } from "./CPlayer";
import { CSettings } from "./CSettings";
import { CShip } from "./CShip";
import { CStaticMesh } from "./CStaticMesh";
import { CTerrain } from "./CTerrain";
import { STATE_GAME, STATE_LOADING } from "./Constants";
import { CMap } from "./CMap";
import { CTools } from "./CTools";

/**
 * mesh phase - meshes are loaded
 * texture_lo phase - lo textures are loaded
 * gameplay starts
 * texture_hi phase - streaming in high res textures and meshes
 */
export class CMission {

    numberOfAssetsRequiredToStart = 0;
    numberOfAssetsLoaded = 0;

    assets = [];
    assetManager;

    constructor(scene) {
        this.scene = scene;
        this.assetManager = new AssetsManager(scene);
        window.assetManager = this.assetManager;
        this.assetManager.useDefaultLoadingScreen = false;
        this.assetManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
            Bus.send(EVT_PROGRESS, { text: lastFinishedTask.name, progress: (totalCount - remainingCount) / totalCount * 100 });
            //console.log(lastFinishedTask.name, (totalCount - remainingCount) / totalCount * 100);
        };
        this.assetManager.onTaskError = (task) => {
            console.error(task.errorObject.message, task);
            Bus.send(EVT_PROGRESS, { text: task.name, text: "Error", progress: 0 });
        };

        this.assetManager.onFinish = (tasks) => {
            console.log("ASSETS LOADED", tasks);
            //this.setupDialogs();
            Bus.send(EVT_PROGRESS, { text: "done", progress: 100 });
            Bus.send("assets-loaded");
            Bus.send(EVT_SETSTATE, STATE_GAME);
        }

        Bus.subscribe(EVT_LOADMISSION, async (mission) => {
            await this.setupMission(mission);

        });
    }

    async setupMission(data) {
        if (CSettings.settings.nomission) {
            return;
        }

        Bus.send(EVT_SETSTATE, STATE_LOADING);
        this.mission = this.loadJSON(data.mission);
        //Bus.send(EVT_SETSTATE, STATE_GAME);
    }

    async loadJSON(mission) {
        return fetch("assets/missions/" + mission.file)
            .then(response => response.json())
            .then(async (json) => {
                this.mission = json;
                this.setupSky();
                this.setupMap();
                Bus.send(EVT_PROGRESS, { text: "Assets", progress: 0 });
                this.setupAssets();
                //await (CTools.sleep(1));
                
                //await (CTools.sleep(1));

                this.setupPlayer();



                this.setupNPCs();

                Bus.send(EVT_PROGRESS, { text: "Physics", progress: 0 });

                this.setupPhysics();

                Bus.send(EVT_PROGRESS, { text: "Physics", progress: 100 });



                if (!CSettings.settings.noaudio) {
                    Bus.send(EVT_PROGRESS, { text: "Audio", progress: 0 });
                    this.setupAudio();
                    Bus.send(EVT_PROGRESS, { text: "Audio", progress: 100 });
                }

                this.assetManager.loadAsync();


                Bus.send("mission-started");


                /*setTimeout(() => {
                    
                    //this.setupTextures("HI");

                }, 15000);                */

                // await this.setupDialogs();

            }).
            catch((error) => {
                Bus.send(EVT_PROGRESS, { text: "Error Loading mission :" + mission + ". \n" + error, progress: 0 });
                console.error("Error loading mission", error);

            }).finally(() => {
                Bus.send(EVT_PROGRESS, { text: "done", progress: 100 });
            });
    }

    async setupSky() {
        console.log("MISSION: Setting up Sky");
        this.mission.forEach((asset) => {
            if (asset.type == "fog") {
                Bus.send(EVT_FOG, asset);
            }
        });
    }

    async setupMap() {
        console.log("MISSION: Setting up Map");
        this.mission.forEach((asset) => {
            if (asset.type == "map") {
                this.map = new CMap(this.scene, this.assetManager, asset);
                this.assets.push(this.map);
            }
        });
    }

    async setupPhysics() {
        console.log("MISSION: Setting up Physics");
        this.assets.forEach((asset) => {
            if (asset.setupPhysics) {
                asset.setupPhysics();
            }
        });
    }

    async setupTextures(RES) {
        console.log("MISSION: Setting up Textures:", RES);
        this.assets.forEach((asset) => {
            if (asset.setupTextures) {
                asset.setupTextures(RES);
            }
        });
    }

    async setupPlayer() {
        console.log("MISSION: Setting up Player");
        this.mission.forEach(async (asset) => {
            if (asset.type == "player") {
                await this.loadPlayer(asset);
            }
        });
    }

    async setupDialogs() {
        console.log("MISSION: Setting up Dialogs");
        this.mission.forEach((asset) => {
            if (asset.type == "dialog") {
                Bus.send("show-dialog", asset);
            }
        });
    }

    async setupAudio() {
        console.log("MISSION: Setting up Audio");
        this.mission.forEach((asset) => {
            if (asset.type == "music") {
                Bus.send("play-music", { name: asset.file });
            }
            if (asset.type == "ambient") {
                Bus.send("play-ambient", { name: asset.file });
            }
        });
    }

    async setupNPCs() {
        console.log("MISSION: Setting up NPCs");
        this.mission.forEach((asset) => {
            if (asset.type == "npc") {
                this.loadNPC(asset);
            }
        });
    }

    async setupAssets() {
        console.log("MISSION: Setting up Assets");
        this.mission.forEach(async (asset) => {
            console.log("MISSION", asset.type);
            if (asset.type == "vehicle") {

                this.loadVehicle(asset);
            }
            if (asset.type == "terrain" && !CSettings.settings.noterrain) {
                promises.push(this.loadTerrain(asset));
            }
            if (asset.type == "ship") {
                this.loadShip(asset);
            }
            if (asset.type == "ocean") {
                this.setupOcean(asset);
            }
            if (asset.type == "staticmesh") {
                this.loadStaticMesh(asset);
            }
        });
    }

    async loadPlayer(asset) {
        this.numberOfAssetsRequiredToStart++;
        // we need to get the player's model and upgrade specs from the server

        let player1 = new CAircraft(this.scene);
        let player = new CPlayer(this.scene, player1, asset);
        player.setup(asset);
        player1.load(asset, this.assetManager)
            .then(() => {
                player1.ready = true;
                Bus.send(EVT_SETPLAYER, { player: player1 });
            });

    }
    async loadNPC(asset) {
        let npc = new CNPC(this.scene);
        await npc.load(asset, false);
    }

    async loadShip(asset) {
        let ship = new CShip(this.scene);
        await ship.setup(asset);
    }

    //async loadVehicle(asset) {
    //  let vehicle = new CVehicle(this.scene);
    //        await vehicle.setupVehicle(asset);
    //}

    async loadTerrain(asset) {
        this.numberOfAssetsRequiredToStart++;
        let terrain = new CTerrain(this.scene);
        this.assets.push(terrain);
        await terrain.load(asset);
    }

    async setupOcean(asset) {
        let ocean = new COcean(this.scene);
        this.assets.push(ocean);
        await ocean.setup(asset);
    }

    async loadStaticMesh(asset) {
        let mesh = new CStaticMesh(this.scene, this.assetManager);
        this.assets.push(mesh);
        mesh.load(asset);
    }
}