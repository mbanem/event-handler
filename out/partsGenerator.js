import { copySelectedComponents } from './copyComponents.js';
export function generateParts(context, panel, paths, payload) {
    copySelectedComponents(context, paths.root, payload.components);
}
//# sourceMappingURL=partsGenerator.js.map