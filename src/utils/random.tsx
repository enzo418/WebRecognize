
/**
 * Generates a random number in a range.
 * Both min and max are included.
 * @export
 * @param {number} min
 * @param {number} max
 * @return {*}
 */
export function random(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
