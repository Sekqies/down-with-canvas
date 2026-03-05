import type { Mesh } from "../rendering/types/mesh";
import { mul_mat4_vec4 } from "./matrix_operators";
import { vec4, type Line, type mat4, type vec3 } from "./types";

export function ray_intersects_ellipsoid(
    line:Line,
    inverse_model:mat4,
    radius_reciprocal:vec3
): boolean{
    if(!inverse_model) return false;

    const local_origin = mul_mat4_vec4(inverse_model,vec4(line.point[0],line.point[1],line.point[2],1.0));
    const local_dir = mul_mat4_vec4(inverse_model,vec4(line.directional_vector[0],line.directional_vector[1],line.directional_vector[2],0.0));

    
    const [ux,uy,uz,uu] = local_dir;
    const px = local_origin[0];
    const py = local_origin[1]
    const pz = local_origin[2]

    const [recip_a,recip_b,recip_c] = radius_reciprocal;
    const A = ux * ux * recip_a + uy * uy * recip_b + uz * uz * recip_c;
    const B = 2 * (px * ux * recip_a + py * uy * recip_b + pz * uz * recip_c);
    const C = px * px * recip_a + py * py * recip_b + pz * pz * recip_c - 1;

    if(C<=0) return true;

    if(B>0) return false;

    const delta = B*B - 4 * A * C;
    return delta >= 0;
}

export function ray_intersects_triangles(
    ray: Line,
    mesh: Mesh,
    inverse_model: mat4
): boolean {
    const local_origin = mul_mat4_vec4(inverse_model, vec4(ray.point[0], ray.point[1], ray.point[2], 1.0));
    const local_dir = mul_mat4_vec4(inverse_model, vec4(ray.directional_vector[0], ray.directional_vector[1], ray.directional_vector[2], 0.0));

    const ox = local_origin[0];
    const oy = local_origin[1];
    const oz = local_origin[2];

    const dx = local_dir[0];
    const dy = local_dir[1];
    const dz = local_dir[2];

    const vertices = mesh.vertices;
    const indices = mesh.indices;
    
    const EPSILON = 0.00001;

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        const v0x = vertices[i0];
        const v0y = vertices[i0 + 1];
        const v0z = vertices[i0 + 2];

        const v1x = vertices[i1];
        const v1y = vertices[i1 + 1];
        const v1z = vertices[i1 + 2];

        const v2x = vertices[i2];
        const v2y = vertices[i2 + 1];
        const v2z = vertices[i2 + 2];

        const e1x = v1x - v0x;
        const e1y = v1y - v0y;
        const e1z = v1z - v0z;

        const e2x = v2x - v0x;
        const e2y = v2y - v0y;
        const e2z = v2z - v0z;

        const hx = dy * e2z - dz * e2y;
        const hy = dz * e2x - dx * e2z;
        const hz = dx * e2y - dy * e2x;

        const a = e1x * hx + e1y * hy + e1z * hz;

        if (a > -EPSILON && a < EPSILON) {
            continue;
        }

        const f = 1.0 / a;

        const sx = ox - v0x;
        const sy = oy - v0y;
        const sz = oz - v0z;

        const u = f * (sx * hx + sy * hy + sz * hz);
        if (u < 0.0 || u > 1.0) {
            continue;
        }

        const qx = sy * e1z - sz * e1y;
        const qy = sz * e1x - sx * e1z;
        const qz = sx * e1y - sy * e1x;
        const v = f * (dx * qx + dy * qy + dz * qz);
        if (v < 0.0 || u + v > 1.0) {
            continue;
        }
        const t = f * (e2x * qx + e2y * qy + e2z * qz);

        if (t > EPSILON && t < 1.0) {
            return true; 
        }
    }

    return false;
}