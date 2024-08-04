import config from '../../config';
import HttpClient from '../../Http/HttpClient';
import CameraService from './CameraService';
import AIServer from './AIServer';
import ConfigurationService from './ConfigurationService';
import LiveViewService from './LiveViewService';
import CameraServiceMock from './mock/CameraServiceMock';
import ConfigurationServiceMock from './mock/ConfigurationServiceMock';
import LiveViewServiceMock from './mock/LiveViewServiceMock';
import NotificationServiceMock from './mock/NotificationServiceMock';
import VideoBufferServiceMock from './mock/VideoBufferServiceMock';
import NotificationService from './NotificationService';
import ObserverService from './ObserverService';
import ServerConfigurationService from './ServerConfigurationService';
import VideoBufferService from './VideoBufferService';

export const client = new HttpClient(config.server);

export const observerService = new ObserverService(client);

export const serverConfigurationService = new ServerConfigurationService(
    client,
);

///*
export const cameraService = new CameraService(client);
export const configurationService = new ConfigurationService(client);
export const defaultCachedConfig = {};
export const notificationService = new NotificationService(
    client,
    cameraService,
);

export const liveViewService = new LiveViewService(client);

export const videoBufferService = new VideoBufferService(client);

export const aiServerService = new AIServer(client);
// */

/* //MOCK

// NOTE:
// -----
// MOCK notifications will only work after you change the port 
// to window.location.port in the config.ts

export const configurationService = new ConfigurationServiceMock(client);

export const cameraService = new CameraServiceMock();

export const notificationService = new NotificationServiceMock(cameraService);

export const liveViewService = new LiveViewServiceMock(client);

export const videoBufferService = new VideoBufferServiceMock(client);
*/
