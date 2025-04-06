import { scene1 } from './scene1.js'
import { scene2 } from './scene2.js'

let currentScene = 'scene1';
let activeScene = null;

async function switchScene(newScene) {
    if (activeScene && activeScene.cleanup) {
        await activeScene.cleanup();
    }
    
    currentScene = newScene;
    
    if (currentScene === 'scene1') {
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.remove();
        });
        activeScene = { run: scene1 };
        console.log('Запущена сцена 1');
        await scene1();
    } else if (currentScene === 'scene2') {
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.remove();
        });
        activeScene = { run: scene2 };
        console.log('Запущена сцена 2');
        await scene2();
    }
}

async function main() {
    document.addEventListener('keydown', async (e) => {
        if (e.key === '-') {
            await switchScene('scene1');
        } else if (e.key === '=') {
            await switchScene('scene2');
        }
    });

    await switchScene(currentScene);
}

main();


// import { initWebGL, createProgram } from './webgl_utils.js';
// import { SceneObject } from './scene_object.js';
// import { Camera } from './camera.js';
// import { Light } from './light.js';
// import { vec3 } from 'gl-matrix';

// async function main() {
//     const canvas = document.createElement('canvas');
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     document.body.appendChild(canvas);

//     const gl = initWebGL(canvas);

//     const shaderProgram = await createProgram(gl);

//     const camera = new Camera(
//         gl,
//         vec3.fromValues(0, 0, 300),
//         vec3.fromValues(0, 0, 0),
//         vec3.fromValues(0, 1, 0),
//         Math.PI / 4,
//         canvas.width / canvas.height,
//         0.1,
//         1000.0
//     );

//     const modelPath = '/models/moon/moon.obj';
//     const texturePath = '/models/moon/orange_color.png';
//     const bumpPath = '/models/moon/bump_orange.jpg';
//     // const texturePath = '/models/moon/MoonMap2_2500x1250.jpg';
//     // const bumpPath = '/models/moon/moon-normal.jpg';
//     const sceneObject1 = await SceneObject.create(gl, modelPath, texturePath, bumpPath, true);
//     const sceneObject2 = await SceneObject.create(gl, modelPath, texturePath, bumpPath, true);
//     let collidableObjects = [];
//     collidableObjects.push(sceneObject2);

//     const pointLight1 = new Light("point", [0, 200, 200], null, [1.0, 1.0, 1.0], 1.0, 0.0);
//     const spotLight1 = new Light("spot", [0, 0, 150], [0, 0, -1], [1.0, 0.5, 0.5], 1.0, Math.PI / 8);

//     let xT = 0.0
//     sceneObject2.model.setScale([0.2, 0.2, 0.2])

//     function animate() {
//         gl.clearColor(0.0, 0.0, 0.0, 1.0);
//         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//         gl.enable(gl.DEPTH_TEST);
//         sceneObject1.model.rotate([1.0, 1.0, 0.0], 0.01)
//         sceneObject1.model.setScale([0.2, 0.2, 0.2])
//         sceneObject1.model.move([xT, 0.0, 0.0])
//         xT += 0.1
//         sceneObject2.model.move([50.0, 0.0, 0.0])
//         gl.useProgram(shaderProgram.program);

//         sceneObject1.render(shaderProgram, camera, [pointLight1]);
//         sceneObject2.render(shaderProgram, camera, [pointLight1]);
//     }

//     function checkCollisions(object) {
//         for (const other of collidableObjects) {
//             if (object !== other && object.model.boundingBox.intersects(other.model.boundingBox)) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     function render() {
//         animate();
//         console.log(checkCollisions(sceneObject1));
//         //console.log(collidableObjects);
//         requestAnimationFrame(render);
//     }

//     render()
// }

// main();