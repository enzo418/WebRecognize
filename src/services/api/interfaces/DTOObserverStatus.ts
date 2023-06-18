export enum CameraType {
    Disabled = 'Disabled',
    Notificator = 'Notificator',
    View = 'View',
}

export interface DTOCameraStatus {
    name: string;
    currentType: CameraType;
    dynamicType: {
        active: boolean;
        isIndefinitely: boolean;
        secondsLeft: number;
        originalType: CameraType;
    };
}

export default interface DTOObserverStatus {
    running: boolean;
    config_id?: string;
    cameras: DTOCameraStatus[];
}
