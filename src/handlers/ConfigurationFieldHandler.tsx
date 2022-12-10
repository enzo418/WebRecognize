import IConfigurationFieldHandler from './interfaces/IConfigurationFieldHandler';
import IConfigurationHandler from './interfaces/IConfigurationHandler';

type callback = (isOk: boolean, message: string) => void;

export default class ConfigurationFieldHandler
    implements IConfigurationFieldHandler
{
    private parent: IConfigurationHandler;
    private field: string;
    private updateCallback: callback;

    constructor(parent: IConfigurationHandler, field: string) {
        this.parent = parent;
        this.field = field;

        this.updateCallback = () => {};
    }

    update<T>(value: T): void {
        this.parent.update(
            { field: this.field, path: this.field },
            { fieldService: this, value },
        );
    }

    subscribeToUpdateResponse(callback: callback) {
        this.updateCallback = callback;
    }

    onUpdated(isOk: boolean, message: string): void {
        this.updateCallback(isOk, message);
    }
}
