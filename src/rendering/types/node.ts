import { mat4, vec3, vec4, type Line } from "../../math/types";
import { identity, translate, rotate, scale } from "../../math/transformations";
import type { Mesh } from "./mesh";
import { inverse_mat4, mul_mat4_vec4 } from "../../math/matrix_operators";
import type { Light } from "./light";
import { ray_intersects_ellipsoid } from "../../math/intersection";

export class Node {
    mesh: Mesh;
    public position: vec3 = vec3(0,0,0);
    public rotation: vec3 = vec3(0, 0, 0); 
    public scale_vec: vec3 = vec3(1, 1, 1);
    public radius:vec3 = vec3(1,1,1);
    public radius_reciprocal:vec3 = vec3(1,1,1);

    public light: Light | null = null;
    
    model: mat4 = identity();
    inverse_model: mat4 = identity();

    constructor(mesh: Mesh, light:Light | null = null) {
        this.mesh = mesh;
        this.light = light;

        this.radius = this.mesh.radius;
        this.radius_reciprocal = this.mesh.radius_reciprocal;
        
        if(this.light){
            this.light.position = this.position;
        }
        this.update_matrix();
    }



    intersects_with(line:Line){
        return ray_intersects_ellipsoid(line, this.inverse_model, this.radius_reciprocal);
    }


    



    update_matrix() {
        let m = identity();
        
        m = translate(m, this.position);
        
        if (this.rotation[2] !== 0) m = rotate(m, this.rotation[2], vec3(0, 0, 1));
        if (this.rotation[1] !== 0) m = rotate(m, this.rotation[1], vec3(0, 1, 0));
        if (this.rotation[0] !== 0) m = rotate(m, this.rotation[0], vec3(1, 0, 0));
        
        m = scale(m, this.scale_vec);

        this.model = m;
        this.inverse_model = inverse_mat4(this.model);
    }
}