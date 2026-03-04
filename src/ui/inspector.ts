export class Inspector {
    private container: HTMLElement;
    public current_node: any | null = null;

    private move_speed = 0.5;
    private rot_speed = 0.26; 
    private scale_factor = 0.1;

    constructor(container_id: string) {
        const el = document.getElementById(container_id);
        if (!el) throw new Error(`Inspector container not found.`);
        this.container = el;
        this.clear();
        this.setup_keyboard_controls();
    }

    public inspect(node: any | null) {
        this.current_node = node;
        this.container.innerHTML = "";

        if (!node) {
            this.clear();
            return;
        }

        this.container.innerHTML = `<h3>Action Inspector</h3>`;
        this.container.innerHTML += `<p style="font-size: 12px; color: gray;">WASD to move X/Z. Q/E to move Y.</p>`;

        this.create_action_row("Move X", 
            () => { node.position[0] -= this.move_speed; node.update_matrix(); },
            () => { node.position[0] += this.move_speed; node.update_matrix(); }
        );
        this.create_action_row("Move Y", 
            () => { node.position[1] -= this.move_speed; node.update_matrix(); },
            () => { node.position[1] += this.move_speed; node.update_matrix(); }
        );
        this.create_action_row("Move Z", 
            () => { node.position[2] -= this.move_speed; node.update_matrix(); },
            () => { node.position[2] += this.move_speed; node.update_matrix(); }
        );

        this.container.appendChild(document.createElement("hr"));

        this.create_action_row("Rotate X", 
            () => { node.rotation[0] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[0] += this.rot_speed; node.update_matrix(); }
        );
        this.create_action_row("Rotate Y", 
            () => { node.rotation[1] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[1] += this.rot_speed; node.update_matrix(); }
        );
        this.create_action_row("Rotate Z", 
            () => { node.rotation[2] -= this.rot_speed; node.update_matrix(); },
            () => { node.rotation[2] += this.rot_speed; node.update_matrix(); }
        );

        this.container.appendChild(document.createElement("hr"));

        this.create_action_row("Scale", 
            () => { 
                node.scale_vec[0] -= this.scale_factor;
                node.scale_vec[1] -= this.scale_factor;
                node.scale_vec[2] -= this.scale_factor;
                node.update_matrix(); 
            },
            () => { 
                node.scale_vec[0] += this.scale_factor;
                node.scale_vec[1] += this.scale_factor;
                node.scale_vec[2] += this.scale_factor;
                node.update_matrix(); 
            }
        );
    }

    private clear() {
        this.container.innerHTML = `<p style="color: gray;">Select an object to inspect.</p>`;
    }

    private create_action_row(label: string, on_minus: () => void, on_plus: () => void) {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "8px";
        
        const label_el = document.createElement("span");
        label_el.innerText = `${label}: `;
        label_el.style.display = "inline-block";
        label_el.style.width = "70px";

        const btn_minus = document.createElement("button");
        btn_minus.innerText = " - ";
        btn_minus.style.width = "30px";
        btn_minus.onclick = on_minus;

        const btn_plus = document.createElement("button");
        btn_plus.innerText = " + ";
        btn_plus.style.width = "30px";
        btn_plus.onclick = on_plus;

        wrapper.appendChild(label_el);
        wrapper.appendChild(btn_minus);
        wrapper.appendChild(btn_plus);
        this.container.appendChild(wrapper);
    }

    private setup_keyboard_controls() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.current_node) return;
            
            let dirty = false;
            
            switch(e.key.toLowerCase()) {
                case 'w': this.current_node.position[2] -= this.move_speed; dirty = true; break; 
                case 's': this.current_node.position[2] += this.move_speed; dirty = true; break;
                case 'a': this.current_node.position[0] -= this.move_speed; dirty = true; break;
                case 'd': this.current_node.position[0] += this.move_speed; dirty = true; break;
                case 'q': this.current_node.position[1] += this.move_speed; dirty = true; break;
                case 'e': this.current_node.position[1] -= this.move_speed; dirty = true; break;
            }

            if (dirty) {
                this.current_node.update_matrix();
            }
        });
    }
}