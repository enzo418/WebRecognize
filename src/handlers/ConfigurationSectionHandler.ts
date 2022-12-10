import ConfigurationFieldHandler from './ConfigurationFieldHandler';
import IConfigurationHandler from './interfaces/IConfigurationHandler';
import IUpdateAction from './interfaces/IUpdateAction';

export default class ConfigurationSectionHandler
    implements IConfigurationHandler
{
    private parent: IConfigurationHandler;
    private section: string;

    constructor(section: string, parent: IConfigurationHandler) {
        this.parent = parent;
        this.section = section;
    }

    update(path: { field: string; path: string }, value: IUpdateAction): void {
        this.parent.update(
            {
                field: path.field,
                path: this.section + '/' + path,
            },
            value,
        );
    }

    createFieldHandler(field: string): ConfigurationFieldHandler {
        return new ConfigurationFieldHandler(this, field);
    }

    createSectionHandler(section: string): ConfigurationSectionHandler {
        return new ConfigurationSectionHandler(section, this);
    }
}
