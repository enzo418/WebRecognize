import IHttpClient from '../Http/IHttpClient';
import IConfigurationService from '../services/api/interfaces/IConfigurationService';
import ConfigurationFieldHandler from './ConfigurationFieldHandler';
import ConfigurationSectionHandler from './ConfigurationSectionHandler';
import IConfigurationHandler from './interfaces/IConfigurationHandler';
import IUpdateAction from './interfaces/IUpdateAction';

export default class ConfigurationHandler implements IConfigurationHandler {
    private service: IConfigurationService;
    private configurationId: string;

    constructor(service:IConfigurationService, configurationId:string) {
        this.service = service;
        this.configurationId = configurationId;
    }

    update(path: {field: string, path: string}, value:IUpdateAction) {
        this.service.setField(this.configurationId, {
            field: path.path,
            value: value.value,
        })
            .ok((_) => value.fieldService.onUpdated.apply(value.fieldService, [true, '']))

            // Here i might use some basic mapping between status codes to text,
            // translations based on codes given in e.code, etc.
            .fail((e) => value.fieldService.onUpdated.apply(
                value.fieldService,
                [false, (e.invalidParams ? e.invalidParams[path.field]?.reason : e.title) || '???'],
            ));
    }

    createFieldHandler(field:string) : ConfigurationFieldHandler {
        return new ConfigurationFieldHandler(this, field);
    }

    createSectionHandler(section:string) : ConfigurationSectionHandler {
        return new ConfigurationSectionHandler(section, this);
    }
}
