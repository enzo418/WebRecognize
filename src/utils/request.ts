export function isRequestOk(status: number) {
    return status >= 200 && status <= 299;
}

export function isRequestError(status: number) {
    return !isRequestOk(status);
}
