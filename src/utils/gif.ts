import { GifReader } from 'omggif';

export default function getFramesFromGif(reader: GifReader): ImageData[] {
    if (!reader) {
        return [];
    }

    // create a hidden DOM canvas
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = reader.width;
    canvas.height = reader.height;

    if (!context) {
        throw new Error("Couldn't create the canvas");
    }

    let frames: ImageData[] = [];

    let frameNumber = 0;
    let previousFrameInfo = null;
    let previousImageData: any;

    while (frameNumber < reader.numFrames()) {
        let frameInfo = reader.frameInfo(frameNumber);

        if (frameNumber === 0) {
            context.clearRect(0, 0, reader.width, reader.height);
        }

        /* -------- GET FRAME CONTEXT OR OVERRIDE CURRENT ------- */

        if (previousFrameInfo) {
            switch (previousFrameInfo.disposal) {
                case 0:
                    // "No disposal specified" - do nothing, we draw over the existing canvas
                    break;
                case 1:
                    // "Do not dispose" - we draw over the existing canvas
                    break;
                case 2:
                    // "Restore to background" - browsers ignore background color, so
                    // in practice it is always "Restore to transparent"
                    context.clearRect(
                        previousFrameInfo.x,
                        previousFrameInfo.y,
                        previousFrameInfo.width,
                        previousFrameInfo.height,
                    );
                    break;
                case 3:
                    // "Restore to previous" - revert back to most recent frame that was
                    // not set to "Restore to previous", or frame 0
                    if (previousImageData) {
                        context.putImageData(previousImageData, 0, 0);
                    }
                    break;
                default:
                    console.error('Disposal method is unsupported');
            }
        }

        if (frameNumber === 0 || frameInfo.disposal < 2) {
            // save this frame in case we need to revert to it later
            previousImageData = context.getImageData(
                0,
                0,
                reader.width,
                reader.height,
            );

            previousImageData.frame = frameNumber;
        }

        /* ------ DRAW FRAME ON TOP OF EXISTING CANVAS DATA ----- */
        let imageData = context.getImageData(0, 0, reader.width, reader.height);

        reader.decodeAndBlitFrameRGBA(frameNumber, imageData.data);

        context.putImageData(
            imageData,
            0,
            0,
            frameInfo.x,
            frameInfo.y,
            frameInfo.width,
            frameInfo.height,
        );

        // save frame
        frames.push(context.getImageData(0, 0, reader.width, reader.height));

        // get ready to draw next frame
        previousFrameInfo = frameInfo;
        frameNumber++;
    }

    return frames;
}
