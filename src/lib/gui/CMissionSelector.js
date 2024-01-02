import * as GUI from '@babylonjs/gui';
import { Bus, EVT_LOADMISSION, EVT_SETSTATE } from "../Bus";
import { GUIHelper } from "./GUIHelper";
import { CGUI } from './CGUI';
import { STATE_CREDITS, STATE_LOADING, STATE_MAINMENU } from '../Constants';

export class CMissionSelector {
    previousState = STATE_LOADING;
    constructor(scene) {
        this.scene = scene;
        this.setupGUI();
        this.loadPilots();
        this.loadMissions();

        Bus.subscribe(EVT_SETSTATE, (state) => {
            if (state === STATE_MAINMENU) {                
                this.missionDialog.isVisible = true;
            } else {
                this.previousState = state;
            }
        });
    }

    async loadPilots() {
        // load the index.json 
        await fetch("/assets/pilots/index.json").then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            this.setupPilots(data);
        });

       /* fetch("/player/getProgression", {
            method: "POST",
            body: JSON.stringify({}),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            //this.setupPilots(data);
        });*/
    }

    loadMissions() {
        // load the index.json 
        fetch("/assets/missions/index.json").then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            this.setupMissions(data);
        });
    }

    setupGUI() {
        const dialog = GUIHelper.createDialog("Mission Selector", 0.75, 0.75, 0, 0, () => {
            //this.missionDialog.isVisible = false;
            Bus.send(EVT_SETSTATE, this.previousState);
        
        });
        dialog.isVisible = true;
        this.missionDialog = dialog;
        //pilots
        const pgrid = new GUI.Grid("pilotgrid");
        dialog.addControl(pgrid);
        pgrid.left = "32px";
        pgrid.top = "64px";
        pgrid.width = 0.5;
        //pgrid.height = 1;        
        pgrid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        pgrid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.pilotGrid = pgrid;
        //misisons
        const grid = new GUI.Grid("missiongrid");
        dialog.addControl(grid);
        grid.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

        grid.width = 0.5;
        grid.height = 1;
        grid.left = "50%";
        grid.top = "32px";
        

        this.missionGrid = grid;
    }

    setupPilots(data) {

        let x = 0;
        let y = 0;

        let size = 128;
        this.pilotGrid.addColumnDefinition(size, true);
        this.pilotGrid.addColumnDefinition(size, true);
        this.pilotGrid.addColumnDefinition(size, true);        
        this.pilotGrid.addRowDefinition(size, true);
        this.pilotGrid.addRowDefinition(size, true);
        this.pilotGrid.addRowDefinition(size, true);

        for (let i = 0; i < data.length; i++) {
           
            const pilot = data[i]
            // show pilots button
            const pilot1 = GUIHelper.createImageButton("/assets/pilots/" + pilot.icon, pilot.name, "120px", "120px", () => {
            }, true);

            pilot1.width = 1;
            pilot1.height = 1;
            //pilot1.left = 32 + x * 128 + "px";
            //pilot1.top = 32 + y * 128 + "px";
            pilot1.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            pilot1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

            let textBlock = new GUI.TextBlock();
            textBlock.text = pilot.rating;
            textBlock.color = "rgb(235,205,100)";
            textBlock.fontSize = 14;
            textBlock.fontFamily = "Arial";
            textBlock.fontWeight = "bold";
            textBlock.left = "-3px";
            textBlock.width = "20px";
            textBlock.height = "20px";
            textBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            textBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
            pilot1.addControl(textBlock);
            this.pilotGrid.addControl(pilot1, y, x);
            x++;
            if (x > 2) {
                x = 0;
                y++;

            }
        }
    }

    setupMissions(data) {

        let x = 0;
        let y = 0;

        this.missionGrid.addColumnDefinition(200, true);        
        this.missionGrid.addColumnDefinition(200, true);        
        
        for (let i = 0; i < data.length; i++) {
                        const mission = data[i]            
            this.missionGrid.addRowDefinition(100, true);
            const button = GUIHelper.createImageButton("/assets/missions/" + mission.icon, mission.name, 1, 1, () => {
                this.missionDialog.isVisible = false;                
                Bus.send(EVT_LOADMISSION, { mission: mission });
            });            
            this.missionGrid.addControl(button, y, x);
            y++;
            if (y >3) {
                y = 0;
                x++;
            }
        }
    }
}