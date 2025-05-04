import { Material } from './material.js';
import { Model } from './model.js';
import { SceneObject } from './scene_object.js';

export function createCube(gl, videoElement) {
    const vertices = new Float32Array([
        // Front face
        -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
        // Back face
        -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
        // Top face
        -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
        // Bottom face
        -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
        // Right face
         0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
        // Left face
        -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5
    ]);
    
    const normals = new Float32Array([
        // Front
         0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,
        // Back
         0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,
        // Top
         0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,
        // Bottom
         0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,
        // Right
         1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,  1.0,  0.0,  0.0,
        // Left
        -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0
    ]);
    
    const texCoords = new Float32Array([
        // Front
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Back
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Top
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Bottom
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Right
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
        // Left
        0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
    ]);
    
    const indices = new Uint16Array([
        // Front
        0,  1,  2,  0,  2,  3,
        // Back
        4,  5,  6,  4,  6,  7, 
        // Top  
        8,  9, 10,  8, 10, 11, 
        // Bottom  
        12, 13, 14, 12, 14, 15,
        // Right  
        16, 17, 18, 16, 18, 19, 
        // Left 
        20, 21, 22, 20, 22, 23   
    ]);
    
    const material = new Material(gl, videoElement, null, 1.0);
    const model = new Model(gl, vertices, normals, texCoords, indices, material);
    const cubeObject = SceneObject.createWithModel(gl, model);
    cubeObject.model = model;
    return cubeObject;
}