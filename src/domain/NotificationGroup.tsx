import Camera from './Camera';

export interface NotificationGroup {
    groupID: number;
    date: Date;
    camera: Camera;
    text?: Notification;
    image?: Notification;
    video?: Notification;
};
