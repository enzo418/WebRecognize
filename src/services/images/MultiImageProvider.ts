import UTIF from 'utif';
import { GifReader } from 'omggif';
import { Size } from '../../Geometry';
import { processPromiseAsArrayBuffer } from '../../Http/ProcessPromise';
import IProblemJson from '../api/interfaces/IProblemJson';
import TypedPromise from '../../TypedPromise';
import {
    IMultiImageProvider,
    MultiImageProviderCallback,
} from './IMultiImageProvider';
import getFramesFromGif from '../../utils/gif';

/**
 * Fetch and parsed a tiff/gif image
 * if you fetch as ImageData you will get ImageData, and getImagesUrl(i) always will
 * return error unless you fetch as imagesUrl
 */
export default class MultiImageProvider implements IMultiImageProvider {
    private imagesUrl: string[];
    private imagesData: ImageBitmap[];
    private lastSuccessFetchUrl: string;
    private imagesSize: Size;
    private onFetchSubscribers: MultiImageProviderCallback[];

    constructor() {
        this.imagesUrl = [];
        this.imagesData = [];
        this.lastSuccessFetchUrl = '';
        this.imagesSize = { width: 0, height: 0 };
        this.onFetchSubscribers = [];
    }

    subscribeToFetchDone(cb: MultiImageProviderCallback): void {
        this.onFetchSubscribers.push(cb);
    }

    fetched(): boolean {
        return this.imagesUrl.length !== 0;
    }

    getImagesUrls(): string[] {
        return this.imagesUrl;
    }

    getImagesSize(): Size {
        return this.imagesSize;
    }

    getTotalImages(): number {
        return this.imagesUrl.length == 0
            ? this.imagesData.length
            : this.imagesUrl.length;
    }

    getImage(index: number): ImageBitmap {
        return this.imagesData[index];
    }

    getImagesData(): ImageBitmap[] {
        // js should return a reference :)
        return this.imagesData;
    }

    getLastSuccessfulFetchUrl(): string {
        return this.lastSuccessFetchUrl;
    }

    fetchImagesAsImageData(url: string) {
        this.imagesData = [];
        return this.fetchImages(url, (rgba, size) => {
            return new Promise<void>((ok, fail) => {
                createImageBitmap(
                    new ImageData(
                        new Uint8ClampedArray(rgba),
                        size.width,
                        size.height,
                    ),
                )
                    .then(bitmap => {
                        this.imagesData.push(bitmap);
                        ok();
                    })
                    .catch(fail);
            });
        });
    }

    fetchImagesAsUrl(url: string) {
        return this.fetchImages(url, (rgba, size) => {
            return new Promise<void>((ok, _) => {
                this.imagesUrl.push(
                    this.imageArrayToObjectUrl(
                        {
                            width: size.width,
                            height: size.height,
                        },
                        rgba,
                    ),
                );
                ok();
            });
        });
    }

    /**
     * Retrieves a .tiff or .gif image, decodes and saves the images and returns a promise
     * that resolves to the total images in the file.
     * @param url url to fetch
     * @param type frames type, raw camera frames or diff frames
     * @returns
     */
    private fetchImages(
        url: string,
        processImage: (
            rgba: Uint8Array | Uint8ClampedArray,
            size: Size,
        ) => Promise<void>,
    ): TypedPromise<number, IProblemJson> {
        this.imagesUrl = [];

        return new TypedPromise<number, IProblemJson>((ok, fail) => {
            processPromiseAsArrayBuffer(fetch(url))
                .ok(response => {
                    this.lastSuccessFetchUrl = url;

                    if (response.contentType == 'image/tiff') {
                        this.decodeTiffImages(response.buffer, processImage)
                            .ok(ok)
                            .fail(fail);
                    } else if (response.contentType == 'image/gif') {
                        this.decodeGifImages(response.buffer, processImage)
                            .ok(ok)
                            .fail(fail);
                    }
                })
                .fail(fail);
        });
    }

    private decodeTiffImages(
        buffer: ArrayBuffer,
        processImage: (
            rgba: Uint8Array | Uint8ClampedArray,
            size: Size,
        ) => Promise<void>,
    ): TypedPromise<number, IProblemJson> {
        return new TypedPromise<number, IProblemJson>((ok, fail) => {
            // decode buffer metadata
            let ids = UTIF.decode(buffer);

            let promises = [];
            for (let i = 0; i < ids.length; i++) {
                // decode image data
                UTIF.decodeImage(buffer, ids[i]);

                let rgba = UTIF.toRGBA8(ids[i]);

                this.imagesSize = {
                    width: ids[i].width,
                    height: ids[i].height,
                };

                const id = ids[i];
                promises.push(
                    processImage(rgba, {
                        width: id.width,
                        height: id.height,
                    }),
                );
            }

            Promise.all(promises).then(() => {
                ok(ids.length);

                this.onFetchSubscribers.forEach(cb => {
                    cb();
                });
            });
        });
    }

    private decodeGifImages(
        buffer: ArrayBuffer,
        processImage: (
            rgba: Uint8Array | Uint8ClampedArray,
            size: Size,
        ) => Promise<void>,
    ): TypedPromise<number, IProblemJson> {
        return new TypedPromise<number, IProblemJson>((ok, fail) => {
            // get reader
            const intArray = new Uint8Array(buffer);
            const reader = new GifReader(intArray as Buffer);
            const info = reader.frameInfo(0);

            // get frames
            // Note: I do this because most GIF use layer optimization so
            // if you try to draw the RGB buffer directly on the canvas
            // without using the "disposal" attribute you will only see garbage.
            const frames: ImageData[] = getFramesFromGif(reader);

            // process frames into bitmap images
            const promises = [];
            for (let i = 0; i < frames.length; i++) {
                promises.push(
                    processImage(frames[i].data, {
                        width: info.width,
                        height: info.height,
                    }),
                );
            }

            Promise.all(promises).then(() => {
                ok(frames.length);

                this.onFetchSubscribers.forEach(cb => {
                    cb();
                });
            });
        });
    }

    freeImages() {
        this.imagesUrl.forEach(imageUrl => {
            URL.revokeObjectURL(imageUrl);
        });

        this.imagesUrl = [];
        this.imagesData = [];
    }

    protected imageArrayToObjectUrl(
        imageSize: Size,
        buffer: Uint8Array | Uint8ClampedArray,
    ) {
        /**
         * The tiff decoded/encoder returned to us a UInt8 array which the RGB pixels,
         * now i want to store those images as url assets, for that we need to convert
         * those pixels data to a format that the browser support, in this case is
         * bitmap and then we create a blob with the mime of the bitmap format.
         */

        // BMP
        const imageArray = buffer;

        const header_size = 54;

        const width = imageSize.width;
        const height = imageSize.height;
        const image_size = width * height;

        const bitmapImage = new Uint8Array(header_size + imageArray.length);

        const view = new DataView(bitmapImage.buffer);

        // File Header

        // BM magic number.
        view.setUint16(0, 0x424d, false);
        // File size.
        view.setUint32(2, imageArray.length, true);
        // Offset to image data.
        view.setUint32(10, header_size, true);

        // BITMAPINFOHEADER

        // Size of BITMAPINFOHEADER
        view.setUint32(14, 40, true);
        // Width
        view.setInt32(18, width, true);
        // Height (signed because negative values flip
        // the image vertically).
        view.setInt32(22, -height, true);
        // Number of colour planes (colours stored as
        // separate images; must be 1).
        view.setUint16(26, 1, true);
        // Bits per pixel.
        view.setUint16(28, 32, true);
        // Compression method, 0 = BI_RGB
        view.setUint32(30, 0, true);
        // Image size in bytes.
        view.setUint32(34, image_size, true);
        // Horizontal resolution, pixels per metre.
        // This will be unused in this situation.
        view.setInt32(38, 0, true);
        // Vertical resolution, pixels per metre.
        view.setInt32(42, 0, true);
        // Number of colours. 0 = all
        view.setUint32(46, 0, true);
        // Number of important colours. 0 = all
        view.setUint32(50, 0, true);

        // write the image data after the header
        bitmapImage.set(imageArray, header_size);

        let blob = new Blob([bitmapImage], {
            type: '	image/bmp',
        });

        return URL.createObjectURL(blob);
    }
}
