import { SceneManager } from "./ui/scene_manager";

const manager = new SceneManager(
    "container",
    "primitive-toolbar",
    "primitive-options",
    "inspector-panel",
    "wireframe-mode",
    "poly-count"
);

manager.start();