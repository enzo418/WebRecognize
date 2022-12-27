import DTOCamera from '../interfaces/DTOCamera';
import Camera from '../../../domain/Camera';

export function parseCameraDTO(dtoCam: DTOCamera): Camera {
    const cam: Camera = {
        id: dtoCam.id,
        name: dtoCam.name,
        url: dtoCam.url,
    };

    return cam;
}

export function parseCamerasDTO(dtoCameras: DTOCamera[]): Camera[] {
    const cameras: Array<Camera> = [];

    dtoCameras.forEach((camera: Camera) => {
        cameras.push(parseCameraDTO(camera));
    });

    return cameras;
}
