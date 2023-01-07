import { Size } from '../../Geometry';

export type MultiImageProviderCallback = () => any;

export interface IMultiImageProvider {
    getImage(index: number): ImageBitmap;
    getImagesSize(): Size;
    getTotalImages(): number;
    subscribeToFetchDone(cb: MultiImageProviderCallback): void;
}
