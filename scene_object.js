import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Model } from './model.js';
import { Material } from './material.js';
import { mat3, mat4 } from './lib/gl-matrix-min.js';
import { BoundingBox } from './bounding_box.js';

class SceneObject {
    constructor(gl, objPath, texturePath, bumpPath, material) {
        this.gl = gl;
        this.material = material ?? new Material(gl, texturePath, bumpPath);
        this.model = null;
    }

    static async create(gl, modelPath, texturePath, bumpPath = null, withCollision = false, material = null) {
        const obj = new SceneObject(gl, modelPath, texturePath, bumpPath, material);
        if(withCollision) await obj.loadOBJWithCollision(modelPath); 
            else await obj.loadOBJ(modelPath); 
        return obj;
    }

    async loadOBJ(objPath) {
        const loader = new OBJLoader();
        const obj = await loader.loadAsync(objPath);
        const mesh = obj.children[0].geometry;

        const vertices = new Float32Array(mesh.attributes.position.array);
        const normals = new Float32Array(mesh.attributes.normal?.array || []);
        const texCoords = new Float32Array(mesh.attributes.uv?.array || []);
        const indices = mesh.index ? new Uint16Array(mesh.index.array) : null;

        this.model = new Model(this.gl, vertices, normals, texCoords, indices, this.material);
    }

    async loadOBJWithCollision(objPath) {
        const loader = new OBJLoader();
        const obj = await loader.loadAsync(objPath);
        const mesh = obj.children[0].geometry;

        const vertices = new Float32Array(mesh.attributes.position.array);
        const normals = new Float32Array(mesh.attributes.normal?.array || []);
        const texCoords = new Float32Array(mesh.attributes.uv?.array || []);
        const indices = mesh.index ? new Uint16Array(mesh.index.array) : null;

        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i+1];
            const z = vertices[i+2];
            
            min[0] = Math.min(min[0], x);
            min[1] = Math.min(min[1], y);
            min[2] = Math.min(min[2], z);
            
            max[0] = Math.max(max[0], x);
            max[1] = Math.max(max[1], y);
            max[2] = Math.max(max[2], z);
        }

        const boundingBox = new BoundingBox(min, max);

        this.model = new Model(this.gl, vertices, normals, texCoords, indices, boundingBox);
    }

    render(shaderProgram, camera, lights, ambientStrengthOverride) {
        if (this.model) {
            const modelMatrix = this.model.getMatrix();
            const viewMatrix = camera.getViewMatrix();
            const projectionMatrix = camera.getProjectionMatrix();
            const modelViewMatrix = mat4.create();
            mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
            const normalMatrix = mat3.create();
            mat3.normalFromMat4(normalMatrix, modelViewMatrix); 
            this.gl.uniformMatrix4fv(shaderProgram.uniformLocations.modelMatrix, false, modelMatrix);
            this.gl.uniformMatrix4fv(shaderProgram.uniformLocations.viewMatrix, false, viewMatrix);
            this.gl.uniformMatrix4fv(shaderProgram.uniformLocations.projectionMatrix, false, projectionMatrix);
            this.gl.uniformMatrix3fv(shaderProgram.uniformLocations.normalMatrix, false, normalMatrix);
            this.gl.uniform3fv(shaderProgram.uniformLocations.cameraPosition, camera.position);
            this.bindLights(shaderProgram, lights);
            this.material.bindTextures(shaderProgram, ambientStrengthOverride);
            this.model.render(shaderProgram);
        }
    }

    bindLights(shaderProgram, lights) {
        const gl = this.gl;
        const maxLights = 10;

        const numLights = Math.min(lights.length, maxLights);
        gl.uniform1i(shaderProgram.uniformLocations.numLights, numLights);

        const lightTypes = new Int32Array(maxLights);
        const lightPositions = new Float32Array(maxLights * 3);
        const lightDirections = new Float32Array(maxLights * 3);
        const lightColors = new Float32Array(maxLights * 3);
        const lightIntensities = new Float32Array(maxLights);
        const lightCutoffAngles = new Float32Array(maxLights);
        const lightAttenuations = new Float32Array(maxLights);

        for (let i = 0; i < numLights; i++) {
            const light = lights[i];

            lightTypes[i] = light.type === "point" ? 0 : 1;

            const pos = light.position;
            lightPositions[i * 3] = pos[0];
            lightPositions[i * 3 + 1] = pos[1];
            lightPositions[i * 3 + 2] = pos[2];

            const dir = light.getDirection();
            lightDirections[i * 3] = dir[0];
            lightDirections[i * 3 + 1] = dir[1];
            lightDirections[i * 3 + 2] = dir[2];

            const color = light.color;
            lightColors[i * 3] = color[0];
            lightColors[i * 3 + 1] = color[1];
            lightColors[i * 3 + 2] = color[2];

            lightIntensities[i] = light.intensity;
            lightCutoffAngles[i] = light.cutoffAngle;
            lightAttenuations[i] = light.attenuationLinear;
        }
        gl.uniform1iv(shaderProgram.uniformLocations.lightTypes, lightTypes);
        gl.uniform3fv(shaderProgram.uniformLocations.lightPositions, lightPositions);
        gl.uniform3fv(shaderProgram.uniformLocations.lightDirections, lightDirections);
        gl.uniform3fv(shaderProgram.uniformLocations.lightColors, lightColors);
        gl.uniform1fv(shaderProgram.uniformLocations.lightIntensities, lightIntensities);
        gl.uniform1fv(shaderProgram.uniformLocations.lightCutoffAngles, lightCutoffAngles);
        gl.uniform1fv(shaderProgram.uniformLocations.lightAttenuations, lightAttenuations);
    }
}

export { SceneObject }