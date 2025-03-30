import { initWebGL, createProgram } from './webgl_utils.js';
import { SceneObject } from './scene_object.js';
import { Camera } from './camera.js';
import { Light } from './light.js';
import { Material } from './material.js';
import { vec3, mat4 } from 'gl-matrix';

async function main() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const gl = initWebGL(canvas);

    const shaderProgram = await createProgram(gl);

    const camera = new Camera(
        gl,
        vec3.fromValues(0, 0, 300),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0),
        Math.PI / 4,
        canvas.width / canvas.height,
        0.1,
        10000.0
    );

    const modelPath = '/models/moon/moon.obj';
    const texturePath = '/models/moon/MoonMap2_2500x1250.jpg';
    const bumpPath = '/models/moon/moon-normal.jpg';
    const moon = await SceneObject.create(gl, modelPath, texturePath, bumpPath, new Material(gl, texturePath, bumpPath, 0.1, 0.0));
    moon.model.setScale(vec3.fromValues(10, 10, 10));
    moon.model.move(vec3.fromValues(0, 0, -1000));

    const shipModelPath = '/models/ship/StarShip.obj';
    const shipTexturePath = '/models/ship/Material.001_Base_color.jpg';
    const ship = await SceneObject.create(gl, shipModelPath, shipTexturePath);
    ship.model.rotate(vec3.fromValues(0.0, 1.0, 0.0), Math.PI);
    ship.model.move(vec3.fromValues(0, 0, 250));

    const pointLight1 = new Light("point", [0, 200, 200], null, [1.0, 1.0, 1.0], 1.0, 0.0);
    const spotLight1 = new Light("spot", [0, 0, 150], [0, 0, -1], [1.0, 0.5, 0.5], 1.0, Math.PI / 8);

    let isFocused = false;
    let yaw = Math.PI;
    let pitch = 0;
    const speed = 1;
    const sensitivity = 0.0001;
    let shipTilt = 0;
    let lastTiltTime = performance.now();

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
            const xoffset = event.movementX * sensitivity;
            const yoffset = event.movementY * sensitivity;

            yaw -= xoffset;
            pitch += yoffset;
            if (pitch > Math.PI / 2 - 0.01) pitch = Math.PI / 2 - 0.01;
            if (pitch < -Math.PI / 2 + 0.01) pitch = -Math.PI / 2 + 0.01;

            mat4.identity(ship.model.rotationMatrix);
            ship.model.rotate(vec3.fromValues(0, 1, 0), yaw);
            ship.model.rotate(vec3.fromValues(1, 0, 0), pitch);

            if (Math.abs(event.movementX) > 5) {
                lastTiltTime = performance.now();
                shipTilt += event.movementX > 0 ? Math.PI / 200 : -Math.PI / 200;
            }
        }
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        const front = ship.model.getFront();
        const right = ship.model.getRight();

        if (key === 'w') vec3.scaleAndAdd(ship.model.position, ship.model.position, front, -speed);
        if (key === 's') vec3.scaleAndAdd(ship.model.position, ship.model.position, front, speed);
        if (key === 'a') {
            vec3.scaleAndAdd(ship.model.position, ship.model.position, right, speed);
            lastTiltTime = performance.now();
            shipTilt -= Math.PI / 50;
        }
        if (key === 'd') {
            vec3.scaleAndAdd(ship.model.position, ship.model.position, right, -speed);
            lastTiltTime = performance.now();
            shipTilt += Math.PI / 50;
        }
        ship.model.updateMatrix();
    });

    function animate() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(shaderProgram.program);

        const currentTime = performance.now();
        if ((currentTime - lastTiltTime) > 200) {
            shipTilt *= 0.9;
        }
        if (shipTilt > Math.PI / 4) shipTilt = Math.PI / 4;
        if (shipTilt < -Math.PI / 4) shipTilt = -Math.PI / 4;

        ship.model.setTilt(shipTilt);

        const offset = vec3.create();
        vec3.scaleAndAdd(offset, ship.model.position, ship.model.getFront(), 40);
        vec3.scaleAndAdd(offset, offset, vec3.fromValues(0.0, 1.0, 0.0), 15);
        camera.move(offset);
        const viewPoint = vec3.clone(ship.model.position);
        vec3.scaleAndAdd(viewPoint, viewPoint, ship.model.getUp(), 7);
        camera.target = vec3.clone(viewPoint);

        moon.model.rotate(vec3.fromValues(0.0, 1.0, 0.0), 0.0001);
        moon.render(shaderProgram, camera, [pointLight1]);
        ship.render(shaderProgram, camera, [pointLight1]);

        requestAnimationFrame(animate);
    }
    animate();
}

main();