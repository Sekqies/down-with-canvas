import { ArrayType, IndexingType, vec3 } from "../../math/types";
import type { Geometry } from "./geometry";
import type { Light } from "./light";
import { Mesh } from "./mesh";



export class Scene{
    projected_buffer!:ArrayType;
    scene_buffer!:ArrayType;
    color_buffer!:ArrayType
    draw_order!: IndexingType;
    raster_color!: ArrayType;
    draw_end!:number;
    meshes!:Mesh[];
    lights!:Light[];

    private scene_cursor = 0;
    private projected_cursor = 0;
    private color_cursor = 0;
    private raster_color_cursor = 0;

    /**
     * Initialize a Scene instance
     * @param geometry If you want a static scene, provide a list of Geometries of all present meshes. If you want a scene that grows to a dynamically large value, provide the maximum number of triangles Scene will store.
     * @returns Nothing
     */
    constructor(geometry: Geometry[] | number, colors:vec3[] | null = null) {
        if (typeof geometry === "number") {
            this.reserve(geometry);
            return;
        }
        let total_tris = 0;
        let total_verts = 0;

        for (let g of geometry) {
            total_tris += g.indices.length / 3;
            total_verts += g.vertices.length / 3;
        }
        this.reserve(total_tris);
        if(colors === null){
            colors = new Array(geometry.length);
            colors.fill(vec3(0.2,0.2,0.2));
        }
        for (let i = 0; i < geometry.length; ++i) {
            const g = geometry[i];
            this.add_mesh(g,colors[i]);
        }
    }
    /**
     * Reserves memory for buffers in scene.
     * @param max_triangles The maximum number of triangles this Scene object can store. 
     */
    reserve(max_triangles:number){
        this.scene_buffer = new ArrayType(max_triangles * 12);
        this.projected_buffer = new ArrayType(max_triangles * 12);
        this.draw_order = new IndexingType(max_triangles);
        this.color_buffer = new ArrayType(max_triangles * 9);
        this.raster_color = new ArrayType(max_triangles * 9);
        this.draw_end = 0;
        this.meshes = [];
        this.lights = [];
    }

    clear(){
        this.scene_cursor = 0;
        this.projected_cursor = 0;
        this.color_cursor = 0;
        this.raster_color_cursor = 0;
        this.meshes = [];
        this.lights = [];
    }

    add_mesh(geometry:Geometry, color:vec3 = vec3(0.2,0.2,0.2), transparent:boolean = false, specular_coefficient:number = Math.random()):Mesh{
        const scene_size = geometry.indices.length * 4;
        const proj_size = geometry.vertices.length/3*4;
        const color_size = geometry.vertices.length;
        const raster_color_size = geometry.indices.length*3;

        const scene_view = this.scene_buffer.subarray(this.scene_cursor, this.scene_cursor + scene_size);
        const proj_view = this.projected_buffer.subarray(this.projected_cursor,this.projected_cursor + proj_size);
        const color_view = this.color_buffer.subarray(this.color_cursor,this.color_cursor + color_size);
        const raster_color = this.raster_color.subarray(this.raster_color_cursor,this.raster_color_cursor + raster_color_size);

        this.scene_cursor += scene_size;
        this.projected_cursor += proj_size;
        this.color_cursor += color_size;
        this.raster_color_cursor += raster_color_size;

        const mesh = new Mesh(geometry,color,raster_color,scene_view,proj_view,color_view,specular_coefficient);
        mesh.transparent = transparent;
        this.meshes.push(mesh);
        return mesh;
    }
    add_light(light:Light){
        this.lights.push(light);
    }

    resize_buffers(new_triangle_capacity: number) {
        const old_scene = this.scene_buffer;
        const old_proj = this.projected_buffer;
        const old_color = this.color_buffer;
        const old_raster_color = this.raster_color;
        const old_draw_order = this.draw_order;

        this.scene_buffer = new ArrayType(new_triangle_capacity * 12);
        this.projected_buffer = new ArrayType(new_triangle_capacity * 12);
        this.color_buffer = new ArrayType(new_triangle_capacity * 9);
        this.raster_color = new ArrayType(new_triangle_capacity * 9);
        this.draw_order = new IndexingType(new_triangle_capacity);

        this.scene_buffer.set(old_scene);
        this.projected_buffer.set(old_proj);
        this.color_buffer.set(old_color);
        this.raster_color.set(old_raster_color);
        this.draw_order.set(old_draw_order);

        let temp_scene_cursor = 0;
        let temp_proj_cursor = 0;
        let temp_color_cursor = 0;
        let temp_raster_color_cursor = 0;

        for (const mesh of this.meshes) {
            const scene_size = mesh.indices.length * 4;
            const proj_size = (mesh.vertices.length / 3) * 4;
            const color_size = mesh.vertices.length;
            const raster_color_size = mesh.indices.length * 3;

            const new_scene_view = this.scene_buffer.subarray(temp_scene_cursor, temp_scene_cursor + scene_size);
            const new_proj_view = this.projected_buffer.subarray(temp_proj_cursor, temp_proj_cursor + proj_size);
            const new_color_view = this.color_buffer.subarray(temp_color_cursor, temp_color_cursor + color_size);
            const new_raster_color_view = this.raster_color.subarray(temp_raster_color_cursor, temp_raster_color_cursor + raster_color_size);

            mesh.rebind_buffers(new_raster_color_view, new_scene_view, new_proj_view, new_color_view);

            temp_scene_cursor += scene_size;
            temp_proj_cursor += proj_size;
            temp_color_cursor += color_size;
            temp_raster_color_cursor += raster_color_size;
        }
    }

    remove_mesh(target_mesh: Mesh) {
        const index = this.meshes.indexOf(target_mesh);
        if (index === -1) return;
        let temp_scene_cursor = 0;
        let temp_proj_cursor = 0;
        let temp_color_cursor = 0;
        let temp_raster_color_cursor = 0;

        for (let i = 0; i < index; i++) {
            const m = this.meshes[i];
            temp_scene_cursor += m.indices.length * 4;
            temp_proj_cursor += (m.vertices.length / 3) * 4;
            temp_color_cursor += m.vertices.length;
            temp_raster_color_cursor += m.indices.length * 3;
        }

        const scene_size = target_mesh.indices.length * 4;
        const proj_size = (target_mesh.vertices.length / 3) * 4;
        const color_size = target_mesh.vertices.length;
        const raster_color_size = target_mesh.indices.length * 3;

        this.scene_buffer.set(this.scene_buffer.subarray(temp_scene_cursor + scene_size, this.scene_cursor), temp_scene_cursor);
        this.projected_buffer.set(this.projected_buffer.subarray(temp_proj_cursor + proj_size, this.projected_cursor), temp_proj_cursor);
        this.color_buffer.set(this.color_buffer.subarray(temp_color_cursor + color_size, this.color_cursor), temp_color_cursor);
        this.raster_color.set(this.raster_color.subarray(temp_raster_color_cursor + raster_color_size, this.raster_color_cursor), temp_raster_color_cursor);

        this.scene_cursor -= scene_size;
        this.projected_cursor -= proj_size;
        this.color_cursor -= color_size;
        this.raster_color_cursor -= raster_color_size;

        this.meshes.splice(index, 1);

        for (let i = index; i < this.meshes.length; i++) {
            const m = this.meshes[i];
            const m_scene_size = m.indices.length * 4;
            const m_proj_size = (m.vertices.length / 3) * 4;
            const m_color_size = m.vertices.length;
            const m_raster_color_size = m.indices.length * 3;

            const new_scene_view = this.scene_buffer.subarray(temp_scene_cursor, temp_scene_cursor + m_scene_size);
            const new_proj_view = this.projected_buffer.subarray(temp_proj_cursor, temp_proj_cursor + m_proj_size);
            const new_color_view = this.color_buffer.subarray(temp_color_cursor, temp_color_cursor + m_color_size);
            const new_raster_color_view = this.raster_color.subarray(temp_raster_color_cursor, temp_raster_color_cursor + m_raster_color_size);

            m.rebind_buffers(new_raster_color_view, new_scene_view, new_proj_view, new_color_view);

            temp_scene_cursor += m_scene_size;
            temp_proj_cursor += m_proj_size;
            temp_color_cursor += m_color_size;
            temp_raster_color_cursor += m_raster_color_size;
        }
    }
    remove_light(light: Light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            this.lights.splice(index, 1);
        }
    }




}