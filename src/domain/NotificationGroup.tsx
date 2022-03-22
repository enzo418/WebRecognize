import Camera from './Camera';
import {MediaNotification, TextNotification} from './Notification';

export interface NotificationGroup {
    groupID: number;
    date: Date;
    camera: Camera;
    text?: TextNotification;
    image?: MediaNotification;
    video?: MediaNotification;
};
