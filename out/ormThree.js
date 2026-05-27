import { log } from 'console';
let models = {};
export function creaateCRUDSupport(panel, paths, payload) {
    log('createCRUDSupport entry point');
    const models = JSON.parse(payload);
    log('creaateCRUDSupport received payload', JSON.stringify({
        models,
    }));
}
//# sourceMappingURL=ormThree.js.map