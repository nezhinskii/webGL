import { mat4, vec3 } from './lib/gl-matrix-min.js';

class Transforms3D {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.rotationMatrix = mat4.create();
        this.baseRotationMatrix = mat4.create();

        this.matrix = mat4.create();
        this.localMatrix = mat4.create();
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
        mat4.multiply(this.baseRotationMatrix, this.baseRotationMatrix, tempMatrix);
        this.updateMatrix();
    }

    setScale(scale) {
        this.scale = scale;
        this.updateMatrix();
    }

    applyTilt(tiltAngle) {
        const localZAxis = vec3.fromValues(0, 0, -1);
        const worldZAxis = vec3.create();
        vec3.transformMat4(worldZAxis, localZAxis, this.baseRotationMatrix);
        vec3.normalize(worldZAxis, worldZAxis);

        const tiltMatrix = mat4.create();
        mat4.fromRotation(tiltMatrix, tiltAngle, worldZAxis);
        mat4.multiply(this.rotationMatrix, this.baseRotationMatrix, tiltMatrix);
        this.updateMatrix();
    }

    updateMatrix() {
        mat4.identity(this.localMatrix);
        mat4.scale(this.localMatrix, this.localMatrix, this.scale);
        mat4.multiply(this.localMatrix, this.localMatrix, this.rotationMatrix);

        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, this.position);
        mat4.multiply(this.matrix, this.matrix, this.localMatrix);
    }

    getMatrix() {
        return this.matrix;
    }

    getFront() {
        const front = vec3.fromValues(0, 0, -1);
        vec3.transformMat4(front, front, this.baseRotationMatrix);
        vec3.normalize(front, front);
        return front;
    }

    getRight() {
        const right = vec3.fromValues(1, 0, 0);
        vec3.transformMat4(right, right, this.baseRotationMatrix);
        vec3.normalize(right, right);
        return right;
    }

    getUp() {
        const up = vec3.fromValues(0, 1, 0);
        vec3.transformMat4(up, up, this.baseRotationMatrix);
        vec3.normalize(up, up);
        return up;
    }
}

export { Transforms3D };

