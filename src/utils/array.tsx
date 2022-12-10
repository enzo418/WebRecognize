export function getPreviousOf<T>(
    array: Array<T>,
    from: number,
    limit: number,
    fillWithNull: boolean = false,
): Array<T | null> {
    const result: Array<T | null> = array.slice(
        Math.max(0, from - limit),
        from,
    );

    if (fillWithNull) {
        const len = result.length;
        for (let i: number = 0; i < limit - len; i++) {
            result.push(null);
        }
    }

    return result;
}

export function getFollowingOf<T>(
    array: Array<T>,
    from: number,
    limit: number,
    fillWithNull: boolean = false,
): Array<T | null> {
    const result: Array<T | null> = array.slice(
        from + 1,
        Math.min(from + limit + 1, array.length),
    );

    if (fillWithNull) {
        const len = result.length;
        for (let i: number = 0; i < limit - len; i++) {
            result.push(null);
        }
    }

    return result;
}

/**
 * Combine two arrays by position.
 * array1 and array2 must have the same length.
 * e.g. [1, 2, 3] and ['a', 'b', 'c']
 * output: [[1, 'a'], [2, 'b'], [3, 'c']]
 * @export
 * @template W
 * @template T extends Array<W>
 * @template V
 * @template S extends Array<V>
 * @param {T} array1
 * @param {S} array2
 * @return {Array<[W, V]>}
 */
export function combineArrayPos<W, T extends Array<W>, V, S extends Array<V>>(
    array1: T,
    array2: S,
): Array<[W, V]> {
    if (array1.length != array2.length)
        throw new Error('Arrays need to have same length!');

    return array1.map((x: W, i: number) => [x, array2[i]]);
}

export function intersect<W, T extends Array<W>>(a: T, b: T): Array<W> {
    return a.filter(value => b.includes(value));
}
