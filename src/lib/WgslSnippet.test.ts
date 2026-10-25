import {describe, expect, it} from "vitest";
import { wgslConstant, WgslSnippet, wgslStruct } from "./WgslSnippet";

describe(WgslSnippet, () => {
    it("formats all references", () => {
        const Splat = wgslStruct("Splat")/* wgsl */`\
    pos: vec3,
    _hom: f32,
    size: vec3,`;

        const nIterations = wgslConstant("N_ITERATIONS")/* wgsl */`3u`;

        const moduleSource = WgslSnippet.source/* wgsl */`\
@compute
@workgroup_size(16, 16)
fn main() {
    let splat = ${Splat}(vec3f(1, 2, 3), 1, vec3f(4, 4, 4));
    for (var i = 0u; i < ${nIterations}; i++) {
        // something
    }
}`;

        expect(moduleSource).toBe(/* wgsl */`\
struct Splat {
    pos: vec3,
    _hom: f32,
    size: vec3,
}
const N_ITERATIONS = 3u;
@compute
@workgroup_size(16, 16)
fn main() {
    let splat = Splat(vec3f(1, 2, 3), 1, vec3f(4, 4, 4));
    for (var i = 0u; i < N_ITERATIONS; i++) {
        // something
    }
}`);
    });
});