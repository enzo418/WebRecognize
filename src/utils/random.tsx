/**
 * Generates a random number in a range.
 * Both min and max are included.
 * @export
 * @param {number} min
 * @param {number} max
 * @return {*}
 */
export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomString(length: number) {
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}
