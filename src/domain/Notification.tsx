import Camera from './Camera';

export enum ENotificationType {
    TEXT,
    IMAGE,
    VIDEO,
}

export default interface Notification {
    id: string;
    date: Date;
    group: number;
    camera: Camera;
    type: ENotificationType;
    configurationID: string;
    // eslint-disable-next-line semi
}

export interface MediaNotification extends Notification {
    mediaURI: string;
}

export interface TextNotification extends Notification {
    text: string;
}
