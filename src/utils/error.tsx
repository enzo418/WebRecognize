export function ensure<T>(
    argument: T | undefined | null,
    message: string = 'Value cannot be null or undefined.',
): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message);
    }

    return argument;
}
