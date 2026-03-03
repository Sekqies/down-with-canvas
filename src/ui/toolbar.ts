import { primitive_map } from "./toolbar_config";
import { Geometry } from "../rendering/types/geometry";

export function initialize_toolbar(
    toolbar_container_id: string,
    options_container_id: string,
    on_create_geometry: (geo:Geometry) => void
) : void{
    const toolbar_el = document.getElementById(toolbar_container_id);
    const options_el = document.getElementById(options_container_id);

    if (!toolbar_el || !options_el){
        console.warn("These ids do not exist: ", toolbar_container_id,options_container_id);
        return
    }
    Object.entries(primitive_map).forEach( ([name, tool]) => {
        const btn = document.createElement("button");
        btn.innerText = name;
        btn.title = tool.description;

        btn.addEventListener("click", () => {
            options_el.innerHTML = `<h3>${name} Options</h3>`;
            
            const inputs: HTMLInputElement[] = [];

            tool.parameters.forEach(param => {
                const wrapper = document.createElement("div");
                
                const label = document.createElement("label");
                label.innerText = `${param.name}: `;
                if (param.toolhint) label.title = param.toolhint;

                const input = document.createElement("input");
                input.type = "range";
                input.min = param.min.toString();
                input.max = param.max.toString();
                input.step = param.step.toString();
                input.value = param.default.toString();

                const value_display = document.createElement("span");
                value_display.innerText = input.value;

                input.addEventListener("input", () => {
                    value_display.innerText = input.value;
                });

                inputs.push(input);

                wrapper.appendChild(label);
                wrapper.appendChild(input);
                wrapper.appendChild(value_display);
                options_el.appendChild(wrapper);
            });

            const create_btn = document.createElement("button");
            create_btn.innerText = "Add to Scene";
            create_btn.addEventListener("click", () => {
                const args = inputs.map(input => parseFloat(input.value));
                const new_geometry = tool.fun(...args);
                on_create_geometry(new_geometry);
            });

            options_el.appendChild(create_btn);
        });

        toolbar_el.appendChild(btn);
    });
}