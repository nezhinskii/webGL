import { initWebGL, createProgram } from './webgl_utils.js';
import { SceneObject } from './scene_object.js';
import { Camera } from './camera.js';
import { Light } from './light.js';
import { Material } from './material.js';
import { vec3, mat4 } from 'gl-matrix';

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
const CAMERA_FOV = Math.PI / 4;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100000.0;
const SPEED = 1;
const SENSITIVITY = 0.001;
const MAX_TILT = Math.PI / 4;
const TILT_DAMPING = 0.9;
const TILT_THRESHOLD = 200;
const TILT_MOUSE_FACTOR = Math.PI / 200;
const TILT_KEY_FACTOR = Math.PI / 200;

function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(canvas);
    return canvas;
}

function initCamera(gl) {
    return new Camera(
        gl,
        vec3.fromValues(0, 0, 300),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0),
        CAMERA_FOV,
        CANVAS_WIDTH / CANVAS_HEIGHT,
        CAMERA_NEAR,
        CAMERA_FAR
    );
}

async function initSceneObjects(gl) {
    const moon = await SceneObject.create(
        gl,
        '/models/moon/moon.obj',
        '/models/moon/MoonMap2_2500x1250.jpg',
        '/models/moon/moon-normal.jpg',
        true,
        new Material(gl, '/models/moon/MoonMap2_2500x1250.jpg', '/models/moon/moon-normal.jpg', 0.001, 0.0)
    );
    moon.model.setScale(vec3.fromValues(50, 50, 50));
    moon.model.move(vec3.fromValues(0, 0, -10000));

    const ship = await SceneObject.create(
        gl,
        '/models/ship/StarShip.obj',
        '/models/ship/Material.001_Base_color.jpg',
        null,
        true,
    );
    ship.model.rotate(vec3.fromValues(0, 1, 0), Math.PI);
    ship.model.move(vec3.fromValues(-100, 150, 300));

    const bigShip = await SceneObject.create(
        gl,
        '/models/big_ship/big_ship.obj',
        '/models/big_ship/Spaceship 04_BaseColor.jpg',
        null,
        true,
    );
    bigShip.model.move(vec3.fromValues(-100, 0, -300));
    bigShip.model.setScale(vec3.fromValues(100, 100, 100));

    const searchlight1 = await SceneObject.create(
        gl,
        '/models/cone/sci_fi_searchlight.obj',
        '/models/cone/sci_fi_searchligh_BaseColor.png',
        null,
        true,
    );
    searchlight1.model.move(vec3.fromValues(0, 100, 0));
    searchlight1.model.rotate(vec3.fromValues(0, 1, 0), Math.PI);
    searchlight1.model.setScale(vec3.fromValues(7, 7, 7));

    const searchlight2 = await SceneObject.create(
        gl,
        '/models/cone/sci_fi_searchlight.obj',
        '/models/cone/sci_fi_searchligh_BaseColor.png',
        null,
        true,
    );
    searchlight2.model.move(vec3.fromValues(-200, 100, 0));
    searchlight2.model.setScale(vec3.fromValues(7, 7, 7));

    const rock1 = await SceneObject.create(
        gl,
        '/models/rock/rock_by_dommk.obj',
        '/models/rock/rock_Base_Color.png',
        '/models/rock/rock_Height.png',
        true,
        new Material(gl, '/models/rock/rock_Base_Color.png', '/models/rock/rock_Height.png', 0.001, 0.0)
    );
    rock1.model.move(vec3.fromValues(-400, 100, -100));
    rock1.model.setScale(vec3.fromValues(1, 1, 1));

    const rock2 = await SceneObject.create(
        gl,
        '/models/rock/rock_by_dommk.obj',
        '/models/rock/rock_Base_Color.png',
        '/models/rock/rock_Height.png',
        true,
        new Material(gl, '/models/rock/rock_Base_Color.png', '/models/rock/rock_Height.png', 0.001, 0.0)
    );
    rock2.model.move(vec3.fromValues(100, 200, -300));
    rock2.model.setScale(vec3.fromValues(1, 1, 1));

    const allObjects = [
        moon,
        ship,
        bigShip,
        searchlight1,
        searchlight2,
        rock1,
        rock2
    ]

    return { moon, ship, allObjects, rock1, rock2 };
}

function initLights() {
    const pointLight = new Light("point", [0, 200, 200], null, [1.0, 1.0, 1.0], 1.0, 0.0);
    const headlight = new Light("spot", [0, 0, 150], [0, 0, -1], [0.0, 1.0, 1.0], 1.0, Math.PI / 12, 0.005);
    const otherSpotLights = [
        new Light("spot", [-170, 170, 0], [0, -1, 0], [1.0, 0.5, 0.0], 1.0, Math.PI / 6, 0.0005),
        new Light("spot", [-30, 170, 0], [0, -1, 0], [1.0, 0.5, 0.0], 1.0, Math.PI / 6, 0.0005)
    ];
    return { headlight, pointLight, otherSpotLights, allLights: [headlight, pointLight, ...otherSpotLights] };
}

function updateShipOrientation(ship, yaw, pitch) {
    mat4.identity(ship.model.rotationMatrix);
    ship.model.rotate(vec3.fromValues(0, 1, 0), yaw);
    ship.model.rotate(vec3.fromValues(1, 0, 0), pitch);
}

function checkCollisions(object, allObjects) {
    for (const other of allObjects) {
        if (object !== other && object.model.boundingBox.intersects(other.model.boundingBox)) {
            return true;
        }
    }
    return false;
}

function updateShipMovement(ship, keys, shipTilt, allObjects) {
    const front = ship.model.getFront();
    const right = ship.model.getRight();
    let tiltChanged = false;
    let newPosition = vec3.clone(ship.model.position);

    if (keys.KeyW) vec3.scaleAndAdd(newPosition, newPosition, front, -SPEED);
    if (keys.KeyS) vec3.scaleAndAdd(newPosition, newPosition, front, SPEED);
    if (keys.KeyA) {
        vec3.scaleAndAdd(newPosition, newPosition, right, SPEED);
        shipTilt -= TILT_KEY_FACTOR;
        tiltChanged = true;
    }
    if (keys.KeyD) {
        vec3.scaleAndAdd(newPosition, newPosition, right, -SPEED);
        shipTilt += TILT_KEY_FACTOR;
        tiltChanged = true;
    }

    const oldPosition = vec3.clone(ship.model.position);
    ship.model.move(newPosition);
    if (checkCollisions(ship, allObjects)) {
        ship.model.move(oldPosition);
    }
    return { shipTilt, tiltChanged };
}

function applyTilt(ship, shipTilt, currentTime, lastTiltTime, keys) {
    if ((currentTime - lastTiltTime) > TILT_THRESHOLD && !(keys.KeyA || keys.KeyD)) {
        shipTilt *= TILT_DAMPING;
    }
    shipTilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, shipTilt));
    ship.model.setTilt(shipTilt);
    ship.model.updateMatrix();
    return shipTilt;
}

function setupInputHandlers(canvas, keys, updateOrientation, updateTilt, toggleLights) {
    let isFocused = false;

    canvas.addEventListener('click', () => {
        if (!isFocused) {
            canvas.requestPointerLock();
            isFocused = true;
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isFocused = document.pointerLockElement === canvas;
    });

    document.addEventListener('mousemove', (event) => {
        if (isFocused) {
            const xoffset = event.movementX * SENSITIVITY;
            const yoffset = event.movementY * SENSITIVITY;
            updateOrientation(xoffset, yoffset);
            if (Math.abs(event.movementX) > 7) {
                updateTilt(event.movementX > 0 ? TILT_MOUSE_FACTOR : -TILT_MOUSE_FACTOR);
            }
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.code in keys) keys[event.code] = true;
        if (event.code === 'Digit1') toggleLights('ambient');
        if (event.code === 'Digit2') toggleLights('headlight');
        if (event.code === 'Digit3') toggleLights('point');
        if (event.code === 'Digit4') toggleLights('otherSpots');
    });

    document.addEventListener('keyup', (event) => {
        if (event.code in keys) keys[event.code] = false;
    });
}

function updateCameraAndHeadlight(camera, headlight, ship) {
    const front = ship.model.getFront();
    const invertedFront = vec3.clone(front);
    vec3.negate(invertedFront, invertedFront);

    const offset = vec3.create();
    vec3.scaleAndAdd(offset, ship.model.position, front, 40);
    vec3.scaleAndAdd(offset, offset, vec3.fromValues(0, 1, 0), 15);
    camera.move(offset);

    const viewPoint = vec3.clone(ship.model.position);
    vec3.scaleAndAdd(viewPoint, viewPoint, ship.model.getUp(), 7);
    camera.target = vec3.clone(viewPoint);

    const headlightOffset = vec3.create();
    vec3.scaleAndAdd(headlightOffset, ship.model.position, invertedFront, 1);
    headlight.move(headlightOffset);
    headlight.initialDirection = vec3.clone(invertedFront);
}

async function scene1() {
    const canvas = createCanvas();
    const gl = initWebGL(canvas);
    const shaderProgram = await createProgram(gl);
    const camera = initCamera(gl);
    const { moon, ship, allObjects, rock1, rock2 } = await initSceneObjects(gl);
    const { headlight, pointLight, otherSpotLights, allLights } = initLights();

    let yaw = Math.PI;
    let pitch = 0;
    let shipTilt = 0;
    let lastTiltTime = performance.now();

    const lightingState = {
        ambient: true,
        headlight: true,
        point: true,
        otherSpots: true
    };

    const keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false };

    const updateOrientation = (xoffset, yoffset) => {
        yaw -= xoffset;
        pitch += yoffset;
        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
        updateShipOrientation(ship, yaw, pitch);
    };

    const updateTilt = (tiltDelta) => {
        shipTilt += tiltDelta;
        lastTiltTime = performance.now();
    };

    const toggleLights = (type) => {
        lightingState[type] = !lightingState[type];
    };

    setupInputHandlers(canvas, keys, updateOrientation, updateTilt, toggleLights);
    
    function animate() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(shaderProgram.program);

        const currentTime = performance.now();
        const { shipTilt: newTilt, tiltChanged } = updateShipMovement(ship, keys, shipTilt, allObjects);
        shipTilt = newTilt;
        if (tiltChanged) lastTiltTime = currentTime;
        shipTilt = applyTilt(ship, shipTilt, currentTime, lastTiltTime, keys);

        updateCameraAndHeadlight(camera, headlight, ship);

        const activeLights = allLights.filter(light => {
            if (light === headlight) return lightingState.headlight;
            if (light === pointLight) return lightingState.point;
            return lightingState.otherSpots;
        });

        moon.model.rotate(vec3.fromValues(0, 1, 0), 0.00005);

        let rock1Pos = vec3.clone(rock1.model.position);
        vec3.scaleAndAdd(rock1Pos, rock1Pos, vec3.fromValues(1, 0.5, -0.2), 0.05);
        rock1.model.move(rock1Pos);
        rock1.model.rotate(vec3.fromValues(0, 1, 1.5), 0.001);

        let rock2Pos = vec3.clone(rock2.model.position);
        vec3.scaleAndAdd(rock2Pos, rock2Pos, vec3.fromValues(-0.5, 0.3, -0.1), 0.05);
        rock2.model.move(rock2Pos);
        rock2.model.rotate(vec3.fromValues(0.2, 1, 0), 0.001);

        allObjects.forEach((m) => 
            m.render(shaderProgram, camera, activeLights, lightingState.ambient ? undefined : 0.0)
        )
        //console.log(checkCollisions(ship, allObjects));
        // console.log(ship.model.boundingBox);
        requestAnimationFrame(animate);
    }

    animate();
}

export { scene1 }