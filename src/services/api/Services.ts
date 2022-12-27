import config from '../../config';
import HttpClient from '../../Http/HttpClient';
import CameraService from './CameraService';
import ConfigurationService from './ConfigurationService';
import LiveViewService from './LiveViewService';
import ConfigurationServiceMock from './mock/ConfigurationServiceMock';
import NotificationService from './NotificationService';
import ObserverService from './ObserverService';
import VideoBufferService from './VideoBufferService';

export const client = new HttpClient(config.server);

export const configurationService = new ConfigurationService(client);

export const liveViewService = new LiveViewService(client);

export const observerService = new ObserverService(client);

export const cameraService = new CameraService(client);

export const notificationService = new NotificationService(
    client,
    cameraService,
);

export const videoBufferService = new VideoBufferService(client);

// export const configurationService = new ConfigurationServiceMock(client);
