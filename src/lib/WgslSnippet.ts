export type WgslSnippetFormatter = (parts: TemplateStringsArray, interpolations: WgslSnippet[]) => string;
export type WgslSnippetReferenceFormatter = () => string;

const joinSnippets = (parts: TemplateStringsArray, interpolations: WgslSnippet[]) => {
    let out = "";

    for (let i = 0; i < interpolations.length; i++) {
        out += parts[i];
        out += interpolations[i].reference();
    }

    out += parts[interpolations.length];

    return out;
};

export class WgslSnippet {
    constructor(
        readonly parts: TemplateStringsArray, 
        readonly interpolations: WgslSnippet[],
        readonly definitionFormatter: WgslSnippetFormatter | null,
        readonly referenceFormatter: WgslSnippetReferenceFormatter | null,
    ) {}

    static source(parts: TemplateStringsArray, ...interpolations: WgslSnippet[]) {
        return new WgslSnippet(parts, interpolations, joinSnippets, null).resolve();
    }

    define() {
        return this.definitionFormatter?.(this.parts, this.interpolations) ?? null;
    }

    reference() {
        if (this.referenceFormatter === null) throw new TypeError("snippet cannot be referenced");

        return this.referenceFormatter();
    }

    resolve() {
        const deepDeps: WgslSnippet[] = [];
        const visited = new Set<WgslSnippet>();
        const dfs = (snippet: WgslSnippet) => {
            for (const dep of snippet.interpolations) {
                if (visited.has(dep)) continue;

                visited.add(dep);
                dfs(dep);
            }

            deepDeps.push(snippet);
        };
        dfs(this);
    
        const out = deepDeps[Symbol.iterator]()
            .map(snippet => snippet.define())
            .filter(definition => definition !== null)
            .toArray()
            .join("\n");

        return out;
    }
}


export const wgslStruct = (name: string) => {
    return (parts: TemplateStringsArray, ...interpolations: WgslSnippet[]) => {
        return new WgslSnippet(
            parts,
            interpolations,
            (parts, interpolations) => /* wgsl */`\
struct ${name} {
${joinSnippets(parts, interpolations)}
}`,
            () => name,
        );
    };
};

export const wgslConstant = (name: string) => {
    return (parts: TemplateStringsArray, ...interpolations: WgslSnippet[]) => {
        return new WgslSnippet(
            parts,
            interpolations,
            (parts, interpolations) => /* wgsl */`\
const ${name} = ${joinSnippets(parts, interpolations)};`,
            () => name,
        );
    };
};