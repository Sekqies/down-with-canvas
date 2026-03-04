import { Node } from "../rendering/types/node";
import { vec3 } from "../math/types";
import type { Line } from "../math/types";
import { Inspector } from "./inspector";
import { create_arrow } from "../rendering/utils/primitives";
import type { Scene } from "../rendering/types/scene";
import { scale } from "../math/transformations";

export type EditorMode = "IDLE" | "TRANSLATE_X" | "TRANSLATE_Y" | "TRANSLATE_Z";

export class EditorState {
    public mode: EditorMode = "IDLE";
    public selected_node: Node | null = null;
    
    public gizmo_x!: Node;
    public gizmo_y!: Node;
    public gizmo_z!: Node;

    private is_dragging = false;
    private last_x = 0;
    private last_y = 0;

    private inspector: Inspector;

    constructor(inspector: Inspector, scene: Scene) {
        this.inspector = inspector;
        this.setup_gizmos(scene);
        this.select(null);
    }

    private setup_gizmos(scene: Scene) {
        const arrow_geo = create_arrow(); 
        
        const mesh_z = scene.add_mesh(arrow_geo, vec3(0, 0, 1), 0);
        this.gizmo_z = new Node(mesh_z);
        
        const mesh_x = scene.add_mesh(arrow_geo, vec3(1, 0, 0), 0);
        this.gizmo_x = new Node(mesh_x);
        this.gizmo_x.rotation[1] = Math.PI / 2; 
        
        const mesh_y = scene.add_mesh(arrow_geo, vec3(0, 1, 0), 0);
        this.gizmo_y = new Node(mesh_y);
        this.gizmo_y.rotation[0] = -Math.PI / 2;

        this.gizmo_x.update_matrix();
        this.gizmo_y.update_matrix();
        this.gizmo_z.update_matrix();
    }

    public select(node: Node | null) {
        this.selected_node = node;
        this.inspector.inspect(node);

        if (node) {
            const scale_amount = node.scale_vec;
            this.gizmo_x.scale_vec = scale_amount;
            this.gizmo_y.scale_vec = scale_amount;
            this.gizmo_z.scale_vec = scale_amount;
            this.update_gizmo_transforms();
        } else {
            this.gizmo_x.scale_vec = vec3(0, 0, 0);
            this.gizmo_y.scale_vec = vec3(0, 0, 0);
            this.gizmo_z.scale_vec = vec3(0, 0, 0);
            this.update_gizmo_transforms();
        }
    }

    public update_gizmo_transforms() {
        if (!this.selected_node) {
            this.gizmo_x.update_matrix();
            this.gizmo_y.update_matrix();
            this.gizmo_z.update_matrix();
            return;
        }

        const pos = this.selected_node.position;
        
        this.gizmo_x.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_y.position = vec3(pos[0], pos[1], pos[2]);
        this.gizmo_z.position = vec3(pos[0], pos[1], pos[2]);
        
        this.gizmo_x.update_matrix();
        this.gizmo_y.update_matrix();
        this.gizmo_z.update_matrix();
    }

    public handle_mouse_down(ray: Line, mouse_x: number, mouse_y: number, scene_nodes: Node[]) {
        this.is_dragging = true;
        this.last_x = mouse_x;
        this.last_y = mouse_y;

        if (this.selected_node) {
            if (this.gizmo_x.intersects_with(ray)) {
                this.mode = "TRANSLATE_X";
                return;
            }
            if (this.gizmo_y.intersects_with(ray)) {
                this.mode = "TRANSLATE_Y";
                return;
            }
            if (this.gizmo_z.intersects_with(ray)) {
                this.mode = "TRANSLATE_Z";
                return;
            }
        }
        for (const node of scene_nodes) {
            if (node.intersects_with(ray)) {
                this.select(node);
                return;
            }
        }
        this.select(null);
    }

    public handle_mouse_move(mouse_x: number, mouse_y: number) {
        if (!this.is_dragging) return;

        const dx = mouse_x - this.last_x;
        const dy = mouse_y - this.last_y;
        
        this.last_x = mouse_x;
        this.last_y = mouse_y;

        if (!this.selected_node || this.mode === "IDLE") return;

        const sensitivity = 0.02;

        if (this.mode === "TRANSLATE_X") {
            this.selected_node.position[0] += dx * sensitivity;
        } else if (this.mode === "TRANSLATE_Y") {
            this.selected_node.position[1] -= dy * sensitivity; 
        } else if (this.mode === "TRANSLATE_Z") {
            this.selected_node.position[2] -= (dx + dy) * sensitivity;
        }

        this.selected_node.update_matrix();
        this.update_gizmo_transforms();
        
        this.inspector.inspect(this.selected_node); 
    }

    public handle_mouse_up() {
        this.is_dragging = false;
        this.mode = "IDLE";
    }

    public get_active_gizmos(): Node[] {
        if (!this.selected_node) return [];
        return [this.gizmo_x, this.gizmo_y, this.gizmo_z];
    }
}