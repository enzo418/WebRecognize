export default interface DTOCamera {
    id: string;
    name: string;
}

export interface DTOCameraDefaults {
    fps: number;
    size: { width: number; height: number };
}
