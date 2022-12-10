/* eslint-disable semi */

export default interface IConfigurationFieldHandler {
    update<T>(value: T): void;

    onUpdated(isOk: boolean, message: string): void;
}
