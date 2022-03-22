import Camera from './Camera';

export enum ENotificationType {
    TEXT,
    IMAGE,
    VIDEO
};

export default interface Notification {
    id: string,
    date: Date;
    group: number;
    camera: Camera;
    type: ENotificationType;
// eslint-disable-next-line semi
};
