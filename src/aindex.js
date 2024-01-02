import * as BABYLON from 'babylonjs';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, Mesh } from "babylonjs";

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine

const scene = new Scene(engine);

const camera = new BABYLON.FreeCamera("camera1",
    new BABYLON.Vector3(0, 5, -12), scene);
// Targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());
// This attaches the camera to the canvas
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light",
    new BABYLON.Vector3(0.5, 1, 0), scene);
    light.intensity = 0.5;

const ground1 = BABYLON.MeshBuilder.CreateGround("ground",
    { width: 16, height: 16, subdivisions: 7 }, scene);
ground1.receiveShadows = true;

engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});