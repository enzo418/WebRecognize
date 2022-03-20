import ICameraService from '../interfaces/ICameraService';
import Camera from '../../../domain/Camera';
import DTOCamera from '../interfaces/DTOCamera';
import { ensure } from '../../../utils/error';

const generateCameras = (n:number) => {
    const generated:DTOCamera[] = [];

    for (let i = 0; i < n; i++) {
        generated.push({
            id: '' + i,
            name: 'cam'+ i,
        });
    }

    return generated;
};

const camerasMock:DTOCamera[] = generateCameras(500);

// const camerasMock = [{
//    id: '1',
//    name: 'cam1',
// }, {
//    id: '2',
//    name: 'cam2',
// }, {
//    id: '3',
//    name: 'cam3',
// }];


export default class CameraServiceMock implements ICameraService {
    cameras: DTOCamera[];

    constructor(cams: DTOCamera[] = camerasMock) {
        this.cameras = cams;
    }

    get(id: string): Promise<Camera> {
        return new Promise((resolve, reject) => {
            resolve(ensure(this.cameras.find((cam) => cam.id === id)));
        });
    }
}
