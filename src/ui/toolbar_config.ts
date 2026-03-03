import { Geometry } from "../rendering/types/geometry";
import * as primitives from "../rendering/utils/primitives";

export type Parameter = {
    name: string;
    type: "number" | "boolean";
    default: number;
    min: number;
    max: number;
    step: number;
    toolhint?: string;
};

export type PrimitiveTool = {
    fun: (...args: any[]) => Geometry;
    description: string;
    parameters: Parameter[];
};

export const primitive_map: Record<string, PrimitiveTool> = {
    "Sphere": {
        fun: primitives.create_sphere,
        description: "Creates a UV sphere.",
        parameters: [
            { name: "radius", type: "number", default: 1.0, min: 0.1, max: 10.0, step: 0.1 },
            { name: "rings", type: "number", default: 16, min: 3, max: 64, step: 1 },
            { name: "slices", type: "number", default: 16, min: 3, max: 64, step: 1 }
        ]
    },
    "3D N-Gon": {
        fun: primitives.create_3d_ngon,
        description: "Creates a standard prism or cylinder.",
        parameters: [
            { name: "n", type: "number", default: 6, min: 3, max: 32, step: 1 },
            { name: "width", type: "number", default: 1.0, min: 0.1, max: 10.0, step: 0.1 },
            { name: "height", type: "number", default: 1.0, min: 0.1, max: 10.0, step: 0.1 }
        ]
    },
    "Frustum": {
        fun: primitives.create_fustrum,
        description: "Creates a tapered prism or cone.",
        parameters: [
            { name: "n", type: "number", default: 8, min: 3, max: 32, step: 1 },
            { name: "bottom_radius", type: "number", default: 1.0, min: 0.0, max: 10.0, step: 0.1 },
            { name: "top_radius", type: "number", default: 0.5, min: 0.0, max: 10.0, step: 0.1 },
            { name: "height", type: "number", default: 1.5, min: 0.1, max: 10.0, step: 0.1 }
        ]
    },
    "Antiprism": {
        fun: primitives.create_antiprism,
        description: "Creates a twisted 3D n-gon.",
        parameters: [
            { name: "n", type: "number", default: 5, min: 3, max: 32, step: 1 },
            { name: "radius", type: "number", default: 1.0, min: 0.1, max: 10.0, step: 0.1 },
            { name: "height", type: "number", default: 1.0, min: 0.1, max: 10.0, step: 0.1 }
        ]
    },
    "Torus": {
        fun: primitives.create_torus,
        description: "Creates a donut-shaped ring.",
        parameters: [
            { name: "inner_radius", type: "number", default: 0.2, min: 0.01, max: 5.0, step: 0.01 },
            { name: "outer_radius", type: "number", default: 0.8, min: 0.1, max: 10.0, step: 0.1 },
            { name: "rings", type: "number", default: 16, min: 3, max: 64, step: 1 },
            { name: "slices", type: "number", default: 16, min: 3, max: 64, step: 1 }
        ]
    }
};