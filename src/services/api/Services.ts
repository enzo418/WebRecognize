import config from '../../config';
import HttpClient from '../../Http/HttpClient';
import ConfigurationService from './ConfigurationService';

const client = new HttpClient(config.server);

export const configurationService = new ConfigurationService(client);
