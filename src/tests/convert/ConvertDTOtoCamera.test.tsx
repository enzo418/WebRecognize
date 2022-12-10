import {
    parseCameraDTO,
    parseCamerasDTO,
} from '../../services/api/convert/ConvertDTOtoCamera';
import DTOCamera from '../../services/api/interfaces/DTOCamera';
import Camera from '../../domain/Camera';

describe('Cameras DTO to camera', () => {
    it('Should parse a camera dto', () => {
        const camDTO: DTOCamera = {
            id: '1',
            name: 'a',
        };

        const expectedCamera: Camera = {
            id: '1',
            name: 'a',
        };

        //
        const result: Camera = parseCameraDTO(camDTO);

        //
        expect(result.id).toBe(expectedCamera.id);
        expect(result.name).toBe(expectedCamera.name);
    });

    it('Should parse a camera dto', () => {
        const camerasDTO: DTOCamera[] = [
            {
                id: '1',
                name: 'a',
            },
        ];

        const expectedCameras: Camera[] = [
            {
                id: '1',
                name: 'a',
            },
        ];

        //
        const result: Camera[] = parseCamerasDTO(camerasDTO);

        //
        result.forEach((cam, i) => {
            const expected: Camera = expectedCameras[i];
            expect(cam.id).toBe(expected.id);
            expect(cam.name).toBe(expected.name);
        });
    });
});
