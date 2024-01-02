"use strict";

import { Scene, ScenePerformancePriority } from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Vector3 } from '@babylonjs/core/Maths/math';
import "@babylonjs/loaders/glTF";
import { MeshBuilder, PointerEventTypes, StringDictionary } from '@babylonjs/core';

import { CKeyboard } from './lib/CKeyboard.js';
import { CGUI } from './lib/gui/CGUI.js';
import { CVehicleStatus } from './lib/gui/CVehicleStatus.js';
import { CPhysics } from './lib/CPhysics.js';
import { CRecorder } from './lib/CRecorder.js';
import { CSettings } from './lib/CSettings.js';
import { CLighting } from './lib/CLighting.js';
import { CCameraMan } from './lib/CCameraMan.js';
import { CAudioMan } from './lib/CAudioMan.js';
import { CSky } from './lib/CSky.js';
import { CMission } from './lib/CMission.js';
import { CMissionSelector } from './lib/gui/CMissionSelector.js';
import { Bus, EVT_SETPLAYER } from './lib/Bus.js';

import { CRadar } from './lib/CRadar.js';
import { STATE_GAME } from './lib/Constants.js';
import { CExplosionManager } from './lib/vehicles/CExplosionManager.js';

const canvas = document.getElementById("renderCanvas"); // Get the canvas element

const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

let player1;
let ship;
let sky;
let cameraMan;

let kbd;
let gui;
let vehiclestatus;
let physics;
let delta = 0;
let mission;
let recorder;
let audio;
let settings;
let lighting;
let radar;
let explosionManager;

const createScene = async function () {
    // Creates a basic Babylon Scene object
    const scene = new Scene(engine);
    scene.gravity = new Vector3(0, -0.45, 0);
    //scene.useRightHandedSystem = true;
    //scene.performancePriority === ScenePerformancePriority.Intermediate;
    kbd = new CKeyboard(scene);

    gui = new CGUI(scene);
    vehiclestatus = new CVehicleStatus(scene, gui.advancedTexture);
    settings = new CSettings(scene);

    physics = new CPhysics(scene);
    await physics.setupPhysics();
    audio = new CAudioMan(scene);
    lighting = new CLighting(scene);
    recorder = new CRecorder(scene);
    radar = new CRadar(scene, gui.advancedTexture);
    mission = new CMission(scene);
    let missionSelector = new CMissionSelector(scene);
    explosionManager = new CExplosionManager(scene);

    cameraMan = new CCameraMan(scene, new Vector3(-41, 110, -2110));
    //await mission.setupMission();
    sky = new CSky(scene);


    Bus.subscribe(EVT_SETPLAYER, (data) => {
        player1 = data.player;
    })


    return scene;
};

async function start() {
    const scene = await createScene(); //Call the createScene function

    

    scene.onBeforePhysicsObservable.add(() => {        
        delta = scene.getAnimationRatio();
        if (player1 && player1.mesh) {
            player1.setInputs(kbd.getInputs(), delta);            
            if (cameraMan) {
                cameraMan.update();
            }
        }
    });

    engine.runRenderLoop(function () {
        scene.render();
    });
}

start();

// Unlock audio on first user interaction.
window.addEventListener('click', () => {
    if (!Engine.audioEngine.unlocked) {
        Engine.audioEngine.unlock();
    }
}, { once: true });

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});