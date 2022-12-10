import { combineArrayPos } from './array';

type EnumType = Record<string, string | number>;

/**
 * Your trying to get the a EnumType from a string that supossedly
 * exists on EnumType? This function does that.
 * If it cannot match any key on the enum, it will throw an error.
 *
 * @export
 * @template T extends EnumType
 * @param {T} pEnum
 * @param {string} type
 * @throws {Error} if cannot find a key
 * @return {number}
 */
export function tryGetEnumValueFromDirtyString<T extends EnumType>(
    pEnum: T,
    type: string,
): number {
    const names = getEnumKeysNames(pEnum).map((t: string) => t.toLowerCase());
    const cleanType: string = type.toLowerCase().trim();
    const indx = names.indexOf(cleanType);
    if (indx != -1) {
        // why so many conversions? We cannot use cleanType since
        // it's on lower case but the type might be on upper case.
        const t = pEnum[indx] as keyof typeof pEnum;
        return getEnumAt(pEnum, t as string);
    } else {
        throw new Error(`Wrong notification type '${type}'`);
    }
}

/**
 * Get the value of an enum based on the name of the key.
 *
 * @export
 * @template T extends EnumType
 * @param {T} pEnum
 * @param {string} type
 * @return {number}
 */
export function getEnumAt<T extends EnumType>(pEnum: T, type: string): number {
    return pEnum[type as keyof typeof pEnum] as number;
}

export function getEnumNameAt<T extends EnumType>(
    pEnum: T,
    type: number,
    lower: boolean,
): string {
    let res = pEnum[type as unknown as keyof typeof pEnum] as string;

    if (lower) {
        res = res.toLowerCase();
    }

    return res;
}

export function getEnumKeys<T>(pEnum: T): Array<number> {
    return Object.keys(pEnum)
        .filter(v => !isNaN(Number(v)))
        .map(v => parseInt(v));
}

/**
 * Return the keys names of the enum.
 *
 * @export
 * @template T
 * @param {T} pEnum
 * @param {boolean} [lower=false] convert names to lowercase
 * @return {Array<string>}
 */
export function getEnumKeysNames<T>(
    pEnum: T,
    lower: boolean = false,
): Array<string> {
    let res = Object.keys(pEnum).filter(v => isNaN(Number(v)));

    if (lower) {
        res = res.map(k => k.toLowerCase());
    }

    return res;
}

export function getEnumKeysValueNames<T>(
    pEnum: T,
    lower: boolean = false,
): Array<[number, string]> {
    const keys = getEnumKeys(pEnum);
    const names = getEnumKeysNames(pEnum, lower);
    return combineArrayPos(keys, names);
}

export function getEnumKeysNamesValue<T>(
    pEnum: T,
    lower: boolean = false,
): Array<[string, number]> {
    const names = getEnumKeysNames(pEnum, lower);
    const keys = getEnumKeys(pEnum);
    return combineArrayPos(names, keys);
}
