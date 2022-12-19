import { Skeleton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    GetFieldCallback,
    UpdateFieldCallback,
} from '../../../context/configurationContext';
import { Size, Rectangle } from '../../../Geometry';
import CanvasHandlerROI from '../../../modules/CanvasHandlerROI';
import { cameraService } from '../../../services/api/Services';
import { ensure } from '../../../utils/error';
import { scaleRectangle } from '../../../utils/geometry';

interface ROICanvasInputFieldProps {
    uri?: string;
    camera_id?: string;
    fieldPath: string;
    enableEditing: boolean;
    fullScreen?: boolean;

    updateCB: UpdateFieldCallback;
    getFieldCB: GetFieldCallback;

    onRoiSelected?: () => any;

    canvasSize: Size;
}

export default function ROICanvasInputField(props: ROICanvasInputFieldProps) {
    const [image, setImage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [initialROI, setInitialROI] = useState<Rectangle>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    const id = props.uri ? { uri: props.uri } : { camera_id: props.camera_id };

    const getCameraPreview = () => {
        setLoading(true);

        cameraService
            .getFrame(id)
            .ok(blob => {
                setImage(URL.createObjectURL(blob));

                // we need to get the field value now
                props.getFieldCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                    ])
                    .ok(storedRoi => {
                        ensure<Rectangle>(storedRoi);

                        // The roi is selected relative to the camera resolution
                        cameraService
                            .getDefaults(id)
                            .ok(({ size }) => {
                                const scaleX =
                                    props.canvasSize.width / size.width;
                                const scaleY =
                                    props.canvasSize.height / size.height;

                                setInitialROI(
                                    scaleRectangle(storedRoi, scaleX, scaleY),
                                );
                                setLoading(false);
                            })
                            .fail(e =>
                                console.error(
                                    'Could not get last resize (processing): ',
                                    e,
                                ),
                            );
                    })
                    .fail(e => {
                        console.log("couldn't get the field value!", {
                            error: e,
                        });
                    });
            })
            .fail(e => {
                console.error('Could not get the camera frame: ', e);
            });
    };

    useEffect(getCameraPreview, [props.uri, props.camera_id]);

    useEffect(() => {
        return () => {
            // free image from memory
            URL.revokeObjectURL(image);
        };
    }, []);

    const onRoiUpdated = (roi: Rectangle) => {
        // We need to get the resize again because it might have been changed here or by another user
        props.getFieldCB;
        cameraService
            .getDefaults(id)
            .ok(({ size }) => {
                const scaleX = size.width / props.canvasSize.width;
                const scaleY = size.height / props.canvasSize.height;

                const scaledRoi = scaleRectangle(roi, scaleX, scaleY);

                props.updateCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                        scaledRoi,
                    ])
                    .ok(() => {
                        if (props.onRoiSelected) {
                            props.onRoiSelected();
                            toast.success('Roi updated', { delay: 2000 });
                        }
                    })
                    .fail(e => console.error('Could not update ROI', e));
            })
            .fail(e =>
                console.error('Could not get last resize (processing): ', e),
            );
    };

    return (
        <>
            {loading ? (
                <Skeleton
                    variant="rectangular"
                    width={`min(${props.canvasSize.width}px, 100%)`}
                    height={props.canvasSize.height}
                />
            ) : (
                <CanvasHandlerROI
                    image={image}
                    onRoiUpdated={onRoiUpdated}
                    initialROI={initialROI}
                    enableEditing={props.enableEditing}
                    canvasSize={props.canvasSize}
                    fullScreen={props.fullScreen}
                />
            )}
        </>
    );
}
