import config from '../../config';
import HttpClient from '../../Http/HttpClient';
import ConfigurationService from './ConfigurationService';
import LiveViewService from './LiveViewService';
import ConfigurationServiceMock from './mock/ConfigurationServiceMock';

const client = new HttpClient(config.server);

export const configurationService = new ConfigurationService(client);

export const liveViewService = new LiveViewService(client);
// export const configurationService = new ConfigurationServiceMock(client);
