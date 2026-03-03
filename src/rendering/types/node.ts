import { mat4, vec3 } from "../../math/types";
import { identity, translate, rotate, scale } from "../../math/transformations";
import type { Mesh } from "./mesh";

export class Node {
    mesh: Mesh;
    position: vec3 = vec3(0,0,0);
    rotation: vec3 = vec3(0, 0, 0); 
    scale_vec: vec3 = vec3(1, 1, 1);
    
    model: mat4 = identity();

    constructor(mesh: Mesh) {
        this.mesh = mesh;
        this.update_matrix();
    }

    update_matrix() {
        let m = identity();
        
        m = translate(m, this.position);
        
        if (this.rotation[2] !== 0) m = rotate(m, this.rotation[2], vec3(0, 0, 1));
        if (this.rotation[1] !== 0) m = rotate(m, this.rotation[1], vec3(0, 1, 0));
        if (this.rotation[0] !== 0) m = rotate(m, this.rotation[0], vec3(1, 0, 0));
        
        m = scale(m, this.scale_vec);

        this.model = m;
    }
}