import Camera from './Camera';
import {MediaNotification, TextNotification} from './Notification';

export interface NotificationGroupTypeMap {
    text?: TextNotification;
    image?: MediaNotification;
    video?: MediaNotification;
}

export interface NotificationGroup extends NotificationGroupTypeMap {
    groupID: number;
    date: Date;
    camera: Camera;
};
