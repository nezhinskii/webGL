import {Transforms3D} from './transforms3d.js';

class Model extends Transforms3D {
    constructor(gl, vertices, normals, texCoords, indices, boundingBox = null) {
        super(boundingBox);
        this.gl = gl;
        this.vertices = vertices;
        this.normals = normals;
        this.texCoords = texCoords;
        this.indices = indices;

        this.vertexBuffer = this.createBuffer(vertices, gl.ARRAY_BUFFER);
        this.normalBuffer = this.createBuffer(normals, gl.ARRAY_BUFFER);
        this.texCoordBuffer = this.createBuffer(texCoords, gl.ARRAY_BUFFER);
        this.indexBuffer = this.createBuffer(indices, gl.ELEMENT_ARRAY_BUFFER);
    }

    createBuffer(data, type) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(type, buffer);
        this.gl.bufferData(type, data, this.gl.STATIC_DRAW);
        return buffer;
    }

    render(shaderProgram) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(shaderProgram.attribLocations.positionLocation);
        gl.vertexAttribPointer(shaderProgram.attribLocations.positionLocation, 3, gl.FLOAT, false, 0, 0);

        if (this.normals) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.enableVertexAttribArray(shaderProgram.attribLocations.normalLocation);
            gl.vertexAttribPointer(shaderProgram.attribLocations.normalLocation, 3, gl.FLOAT, false, 0, 0);
        }

        if (this.texCoords) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.enableVertexAttribArray(shaderProgram.attribLocations.texCoordLocation);
            gl.vertexAttribPointer(shaderProgram.attribLocations.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        }

        if (this.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        }
    }
}

export { Model }