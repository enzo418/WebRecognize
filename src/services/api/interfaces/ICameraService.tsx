import Camera from '../../../domain/Camera';

export default abstract class ICameraService {
    abstract get(id: string): Camera;
}
