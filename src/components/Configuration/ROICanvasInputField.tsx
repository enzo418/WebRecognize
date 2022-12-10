import React, { useEffect, useState } from 'react';
import config from '../../config';
import { Rectangle, Size } from '../../Geometry';
import CanvasHandlerROI from '../../modules/CanvasHandlerROI';
import { client } from '../../services/api/Services';

import {
    GetFieldCallback,
    UpdateFieldCallback,
} from '../../context/configurationContext';
import { Skeleton } from '@mui/material';
import { ensure } from '../../utils/error';
import { scaleRectangle } from '../../utils/geometry';

interface ROICanvasInputFieldProps {
    uri?: string;
    camera_id?: string;
    fieldPath: string;

    updateCB: UpdateFieldCallback;
    getFieldCB: GetFieldCallback;
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

    const getCameraPreview = () => {
        setLoading(true);

        const query = props.uri
            ? { uri: props.uri }
            : { camera_id: props.camera_id };

        client
            .get(config.endpoints.api.cameraFrame, query, {
                cache: 'force-cache',
            })
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const blob = new Blob([buffer], {
                    type: 'image/jpeg',
                });

                setImage(URL.createObjectURL(blob));

                // we need to get the field value now
                props.getFieldCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                    ])
                    .ok(storedRoi => {
                        ensure<Rectangle>(storedRoi);

                        // we need the resize at the processing stage to scale down/up the selected ROI
                        props.getFieldCB
                            .apply(null, [
                                `cameras/${props.camera_id}/processingConfiguration/resize`,
                            ])
                            .ok((resize: Size) => {
                                const scaleX = 640.0 / resize.width;
                                const scaleY = 360.0 / resize.height;

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
            .catch(e => {
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
        props.getFieldCB
            .apply(null, [
                `cameras/${props.camera_id}/processingConfiguration/resize`,
            ])
            .ok((resize: Size) => {
                const scaleX = resize.width / 640.0;
                const scaleY = resize.height / 360.0;

                const scaledRoi = scaleRectangle(roi, scaleX, scaleY);

                props.updateCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                        scaledRoi,
                    ])
                    .ok(() => {})
                    .fail(e => console.error('Could not update ROI', e));
            })
            .fail(e =>
                console.error('Could not get last resize (processing): ', e),
            );
    };

    return (
        <>
            {loading ? (
                <Skeleton variant="rectangular" width={640} height={360} />
            ) : (
                <CanvasHandlerROI
                    image={image}
                    onRoiUpdated={onRoiUpdated}
                    initialROI={initialROI}
                />
            )}
        </>
    );
}
