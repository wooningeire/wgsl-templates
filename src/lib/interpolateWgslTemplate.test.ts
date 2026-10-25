import {describe, expect, it} from "vitest";
import { interpolateWgslTemplate } from "./interpolateWgslTemplate";
import { WgslStruct } from "./WgslStruct";

describe(interpolateWgslTemplate, () => {
    it("defines a referenced struct", () => {
        const Splat = WgslStruct.fromCode(/* wgsl */`\
struct Splat {
    pos: vec3,
    _hom: f32,
    size: vec3,
}`);

        const src = interpolateWgslTemplate/* wgsl */`\
@compute
@workgroup_size(16, 16)
fn main(splat: ${Splat}) {}`;

        expect(src.startsWith("struct Splat"));
    });
});