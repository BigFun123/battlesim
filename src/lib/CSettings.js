import { Bus, EVT_SETSTATE } from './Bus.js';

export class CSettings {
    static _instance;
    
    /**
     * 0 = splash
     * 1 = main menu
     * 2 = game
     * 3 = settings
     * 4 = pause
     * 5 = game over
     * 6 = mission complete
     * 7 = dialog
     * 8 = cutscene
     * 9 = credits
     * 10 = high scores
     * 11 = load game
     * 12 = save game
     * 13 = options
     * 14 = multiplayer
     * 15 = multiplayer lobby     
     */
    static state = 0;

    static settings = {
        debug:true,
        showSplash: true,
        depthOfField: false,
        soundVolume: 0.5,
        musicVolume: 0.15,
        ambientVolume: 0.15,
        noterrain: false,
        nowater: false,
        nosky: false,
        terrainDetail: 32,
        tilesAmount: 2

    }
    constructor(scene) {
        this.scene = scene;

        // get url parameters
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        CSettings.settings.noterrain = params.get("nomission") || false;
        CSettings.settings.noaudio = params.get("noaudio") || false;
        console.log("Audio is " , CSettings.settings.noaudio);


        this.loadSettings();
        Bus.subscribe("showsettings", (data) => {
            this.showGUI();
        });

        Bus.subscribe(EVT_SETSTATE, (state) => {
            CSettings.state = state;
        });
    }

    static getInstance() {
        if (!CSettings._instance) {
            CSettings._instance = new CSettings();
        }
        return CSettings._instance ;
    }

    loadSettings() {

    }
}

