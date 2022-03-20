export function getPreviousOf<T>(
    array: Array<T>,
    from:number,
    limit:number,
    fillWithNull:boolean = false,
) : Array<T | null> {
    const result: Array<T | null> = array.slice(Math.max(0, from - limit), from);

    if (fillWithNull) {
        const len = result.length;
        for (let i:number = 0; i < limit - len; i++) {
            result.push(null);
        }
    }

    return result;
}

export function getFollowingOf<T>(
    array: Array<T>,
    from:number,
    limit:number,
    fillWithNull:boolean = false,
) : Array<T | null> {
    const result:Array<T | null> = array.slice(
        from + 1,
        Math.min(from + limit + 1, array.length),
    );

    if (fillWithNull) {
        const len = result.length;
        for (let i:number = 0; i < limit - len; i++) {
            result.push(null);
        }
    }

    return result;
}
