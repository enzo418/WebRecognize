import { Polygon, Rectangle } from '../../../Geometry';

export interface DTOBlob {
    first_appearance: number;
    last_appearance: number;

    // first rect is the one from frames[first_appearance], same for last
    rects: Rectangle[];

    internal_id: number;
}

export default interface DTOVideoBuffer {
    id: string;
    camera_id: string;
    duration: string;
    state: 'without_buffer' | 'with_buffer' | 'detected';
    date_unix: number;
    fps?: number; // on with_buffer
    contours?: Array<Polygon[]>; // on detected
    blobs?: DTOBlob[]; // on detected
}
