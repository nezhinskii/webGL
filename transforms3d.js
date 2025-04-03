import { mat4, vec3 } from './lib/gl-matrix-min.js';

class Transforms3D {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.initialRotationMatrix = mat4.create();
        this.rotationMatrix = mat4.create();
        this.tiltMatrix = mat4.create();
        this.matrix = mat4.create();
        this.updateMatrix();
    }

    setInitialRotation(axis, angle) {
        mat4.fromRotation(this.initialRotationMatrix, angle, axis);
        this.updateMatrix();
    }

    move(vector) {
        this.position = vector;
        this.updateMatrix();
    }

    rotate(axis, angle) {
        const tempMatrix = mat4.create();
        mat4.fromRotation(tempMatrix, angle, axis);
        mat4.multiply(this.rotationMatrix, this.rotationMatrix, tempMatrix);
        this.updateMatrix();
    }

    setScale(scale) {
        this.scale = scale;
        this.updateMatrix();
    }

    setTilt(tiltAngle) {
        const worldZAxis = this.getFront();
        mat4.fromRotation(this.tiltMatrix, tiltAngle, worldZAxis);
        this.updateMatrix();
    }

    updateMatrix() {
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.position);
        mat4.multiply(this.matrix, this.matrix, this.initialRotationMatrix);
        mat4.multiply(this.matrix, this.matrix, this.rotationMatrix);
        mat4.multiply(this.matrix, this.matrix, this.tiltMatrix);
        mat4.scale(this.matrix, this.matrix, this.scale);
    }

    getMatrix() {
        return this.matrix;
    }

    getFront() {
        const front = vec3.fromValues(0, 0, -1);
        vec3.transformMat4(front, front, this.rotationMatrix);
        vec3.normalize(front, front);
        return front;
    }

    getRight() {
        const right = vec3.fromValues(1, 0, 0);
        vec3.transformMat4(right, right, this.rotationMatrix);
        vec3.normalize(right, right);
        return right;
    }

    getUp() {
        const up = vec3.fromValues(0, 1, 0);
        vec3.transformMat4(up, up, this.rotationMatrix);
        vec3.normalize(up, up);
        return up;
    }
}

export { Transforms3D };