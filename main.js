import { initWebGL, createProgram } from './webgl_utils.js';
import { Camera } from './camera.js';
import { Light } from './light.js';
import { vec3 } from 'gl-matrix';
import { createCube } from './cube_obj.js';
import { setupVideo, copyVideo } from './setup_video.js';

async function main() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const gl = initWebGL(canvas);

    const shaderProgram = await createProgram(gl);

    const initialDistance = 5.0;
    const camera = new Camera(
        gl,
        vec3.fromValues(0, 0, -initialDistance),
        vec3.fromValues(0, 0, 0),
        vec3.fromValues(0, 1, 0),
        Math.PI / 4,
        canvas.width / canvas.height,
        0.1,
        1000.0
    );

    const video = setupVideo();

    const image = new Image();
    await new Promise((resolve) => {
        image.onload = () => {
            resolve();
        };
        image.src = '/models/spiral.jpg';
    });

    const cubeObject = createCube(gl, video);

    // const pointLight1 = new Light("point", [0, 10, 0], null, [1.0, 1.0, 1.0], 1.0, 0.0);
    // cubeObject.addLight(pointLight1);

    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let phi = 0;
    let theta = Math.PI / 2;
    let distance = initialDistance;
    const minDistance = 1.0;
    const maxDistance = 10000.0;

    function updateCameraPosition() {
        const x = distance * Math.sin(theta) * Math.cos(phi);
        const y = distance * Math.cos(theta);
        const z = distance * Math.sin(theta) * Math.sin(phi);

        // pointLight1.move(vec3.fromValues(x, y, z));
        camera.move(vec3.fromValues(x, y, z));
    }

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - previousMouseX;
            const deltaY = event.clientY - previousMouseY;
            phi += deltaX * 0.005;
            theta = Math.max(0.05, Math.min(Math.PI - 0.05, theta - deltaY * 0.005));
            updateCameraPosition();
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        distance += event.deltaY * 0.005;
        distance = Math.max(minDistance, Math.min(maxDistance, distance));
        updateCameraPosition();
    });

    let textureMode = 0;
    document.addEventListener('keydown', (event) => {
        if (event.key === '1') {
            textureMode = 0;
            updateTexture(gl, cubeObject.material.texture, video);
        } else if (event.key === '2') {
            textureMode = 1;
            updateTexture(gl, cubeObject.material.texture, image);
        } else if (event.key === '3') {
            textureMode = 2;
        }
    });

    function updateTexture(gl, texture, video) {
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
    }

    let startTime = Date.now();
    function animate() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(shaderProgram.program);
        cubeObject.render(shaderProgram, camera);

        if (copyVideo && textureMode === 0) {
            updateTexture(gl, cubeObject.material.texture, video);
        }

        const elapsedTime = Date.now() - startTime;
        gl.uniform1f(shaderProgram.uniformLocations.time, elapsedTime);
        gl.uniform1i(shaderProgram.uniformLocations.textureMode, textureMode);
        requestAnimationFrame(animate);
    }
    animate();
}

main();