/**
 * This class holds a cache of a configuration so we can provide initial
 * values while the backend responds, because we always use fresh data.
 */
export default class CachedConfiguration {
    map: Record<string, any>;

    constructor() {
        this.map = {};
    }

    /**
     * get a element from a path
     * @param path / separated keys
     * @returns value or undefined
     */
    get(path: string): any {
        return path.split('/').reduce((a, v, i, arr) => {
            if (v in a) return a[v];
            else arr.splice(1); // stop reducer
        }, this.map);
    }

    /**
     * updates a value from a path
     * @param path / separated keys
     * @param value value to store
     */
    update(path: string, value: any): void {
        const keys = path.split('/');
        const lastKey = keys.splice(keys.length - 1, 1)[0];
        this.getOrCreate(keys.join('/'))[lastKey] = value;
    }

    private getOrCreate(path: string): any {
        return path.split('/').reduce((a, v) => {
            if (!(v in a)) a[v] = {};
            return a[v];
        }, this.map);
    }
}
