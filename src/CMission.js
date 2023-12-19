class CMission {
    constructor(scene) {
        this.scene = scene;        
    }
    
    async setupMission() {
        this.mission = await this.loadJSON();
    }

    async loadJSON() {
        return fetch("assets/missions/m1.json")
            .then(response => response.json())
            .then(json => {                
                this.mission = json;
                this.setupAssets();
            });
    }

    async setupAssets() {
        this.mission.forEach((asset) => {
            console.log(asset);
            if (asset.type == "vehicle") {
                this.loadVehicle(asset);
            }
            if (asset.type=="terrain") {
                this.loadTerrain(asset);
            }
            if (asset.type=="ship") {
                this.loadShip(asset);
            }
        });
    }

    async loadShip(asset) {
        let ship = new CShip(this.scene);
        await ship.setup(asset);
    }

    async loadVehicle(asset) {
        let vehicle = new CVehicle(this.scene);
        await vehicle.setupVehicle(asset);
    }

    async loadTerrain(asset) {
        let terrain = new CTerrain(this.scene);
        await terrain.load(asset);
    }
}