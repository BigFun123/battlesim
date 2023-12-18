const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

let player1;
let ship;

let cameraMan;
let kbd;
let gui;
let physics;
let lerptime = 110.005;
let delta = 0;

const createScene = async function () {
    // Creates a basic Babylon Scene object
    const scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
    scene.useRightHandedSystem = true;
    kbd = new CKeyboard(scene);
    cameraMan = new CCameraMan(scene);
    gui = new CGUI(scene);

    physics = new CPhysics(scene);
    await physics.setupPhysics();

    // Creates a light, aiming 0,1,0 - to the sky
    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(0, 1, 0), scene);
    // Dim the light a small amount - 0 to 1
    light.intensity = 0.93;


    //var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    //light2.intensity= 12;
    //light2.position = new BABYLON.Vector3(0, 5, 5);
    // Shadows
    //var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    //shadowGenerator.useBlurExponentialShadowMap = true;
    //shadowGenerator.blurKernel = 2;
    //shadowGenerator.blurScale = 2;
    //shadowGenerator.useKernelBlur = true;


    // Built-in 'sphere' shape.
    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere",
        { diameter: 2, segments: 32 }, scene);
    sphere.position.x = 10;
    sphere.position.y = 15;
    const sphereAggregate = new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.9, friction: 0.5 }, scene);
    // Built-in 'ground' shape.
    //const ground1 = BABYLON.MeshBuilder.CreateGround("ground",
    //  { width: 6, height: 6, subdivisions: 2 }, scene);
    //const groundAggregate = new BABYLON.PhysicsAggregate(ground1, BABYLON.PhysicsShapeType.BOX, { mass: 0, restitution: 0.9, friction: 0.5 }, scene);


    // Create a built-in "ground" shape.
    const ground = BABYLON.MeshBuilder.CreateGround("ground",
        { width: 2, height: 2, subdivisions: 128 }, scene);
    ground.position.y = -100;


    const sky = new CSky(scene);

    //BABYLON.NodeMaterial.ParseFromSnippetAsync("#3FU5FG#1", scene).then((mat) => {
    BABYLON.NodeMaterial.ParseFromFileAsync("ocean", "/assets/oceanMaterial.json", scene).then((mat) => {
        ground.material = mat;
        ground.scaling = new BABYLON.Vector3(12000, 270, 12000);
        window.mat = mat;
    });

    player1 = new CAircraft("MiG-29.glb", scene);

    player1.load(new BABYLON.Vector3(0, 0, 0), false)
        .then(() => {
            //camera.setTarget(player1.mesh.position.add(player1.mesh.forward.scale(15)).add(player1.mesh.up.scale(19)));
            //player1.setHome(0, 14, 0);
            //player1.moveTo(0, 2, 0);
            //camera.parent = player1.mesh;
            cameraMan.setLockedTarget(player1.mesh);            
            //cameraMan.setLockedTarget(player1.mesh);            
            //cameraMan.setParent(player1.mesh);
        });


    ship = new CShip("gerald ford carrier deck.glb", scene)
    ship.load(new BABYLON.Vector3(30, -70.5, 40), true)
        .then(() => {
            console.log("ship loaded");
        });

    return scene;
};

async function start() {
    const scene = await createScene(); //Call the createScene function
    // Register a render loop to repeatedly render the scene
    scene.onBeforePhysicsObservable.add(() => {
        //console.log("before physics");
        //player1.update();
        delta = scene.getPhysicsEngine().getTimeStep()
        if (player1 && player1.mesh) {
            player1.setInputs(kbd.getInputs(), delta);
            gui.setDebugText(player1.getDebugText());
        }
        cameraMan.update();
    });
    scene.registerBeforeRender(() => {
        //delta = engine.getDeltaTime();
       
        
        //cameraMan.update();
    });
    engine.runRenderLoop(function () {
        
        if (player1.mesh) {
            //player1.setInputs(kbd.getInputs(), delta);
            //const CameraOffsetVector = player1.mesh.position
            //  .add(player1.mesh.forward.scale(29 + player1.power * 0.1))
            //.add(player1.mesh.up.scale((player1.maxpower - player1.power) * 0.5+ 1));
            //BABYLON.Vector3.SmoothToRef(camera.position.clone(), CameraOffsetVector, delta, lerptime, camera.position);
            //BABYLON.Vector3.SmoothToRef(camera.rotation, CameraOffsetVector, delta, lerptime, camera.rotation);
            // follow the player
            //camera.position = CameraOffsetVector;
            
        }

        //if (player1.mesh) {
        //camera.setTarget(player1.mesh.position);
        //}

        scene.render();
    });
}

start();

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});