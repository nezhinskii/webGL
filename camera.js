import {Transforms3D} from './transforms3d.js';
import { mat4, vec3 } from './lib/gl-matrix-min.js';

class Camera extends Transforms3D{
    constructor(gl, position, target, up, fov, aspect, near, far) {
        super();
        this.gl = gl;
        this.move(position);
        this.target = target;
        this.up = up;
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    getViewMatrix() {
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, this.position, this.target, this.up);
        return viewMatrix;
    }

    getProjectionMatrix() {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.fov, this.aspect, this.near, this.far);
        return projectionMatrix;
    }
}

export { Camera }