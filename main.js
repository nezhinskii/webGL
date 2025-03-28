import { initWebGL, createProgram } from './webgl_utils.js';
import { SceneObject } from './scene_object.js';
import { Camera } from './camera.js';
import { Light } from './light.js';
import { vec3 } from 'gl-matrix';

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
        1000.0
    );

    const modelPath = '/models/moon/moon.obj';
    const texturePath = '/models/moon/orange_color.png';
    const bumpPath = '/models/moon/bump_orange.jpg';
    // const texturePath = '/models/moon/MoonMap2_2500x1250.jpg';
    // const bumpPath = '/models/moon/moon-normal.jpg';
    const sceneObject = await SceneObject.create(gl, modelPath, texturePath, bumpPath);

    const pointLight1 = new Light("point", [0, 200, 200], null, [1.0, 1.0, 1.0], 1.0, 0.0);
    const spotLight1 = new Light("spot", [0, 0, 150], [0, 0, -1], [1.0, 0.5, 0.5], 1.0, Math.PI / 8);


    function animate() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        sceneObject.model.rotate([1.0, 1.0, 0.0], 0.01)
        gl.useProgram(shaderProgram.program);

        sceneObject.render(shaderProgram, camera, [pointLight1]);

        requestAnimationFrame(animate);
    }
    animate();
}

main();