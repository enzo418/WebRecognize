import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useConfiguration } from '../../../context/configurationContext';
import { Size } from '../../../Geometry';
import CanvasDisplayBlobDistanceThreshold from '../../../modules/CanvasDisplayBlobDistanceThreshold';
import { DTOCameraDefaults } from '../../../services/api/interfaces/DTOCamera';
import { cameraService } from '../../../services/api/Services';
import { SliderConfigurationField } from '../configurationField';

export default function BlobDetectorParametersConfiguration() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    const [loading, setLoading] = useState<boolean>(true);

    const [cameraDefaults, setCameraDefaults] = useState<DTOCameraDefaults>({
        fps: 10,
        size: {
            width: 0,
            height: 0,
        },
    });

    const id = { camera_id: params?.camera_id };

    useEffect(() => {
        setLoading(true);

        cameraService
            .getDefaults(id)
            .ok(v => {
                setCameraDefaults(v);
                setLoading(false);
            })
            .fail(e => console.error('could not get camera defaults', e));
    }, []);

    const marks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: Math.max(
                1,
                cameraDefaults.size.height,
                cameraDefaults.size.width,
            ),
            label: 'MAX',
        },
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography>
                    Maximum distance between a blob and a finding to be
                    considered the same
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This value should be higher when objects appear farther away
                    from the lens and lower otherwise.
                </Typography>
                <SliderConfigurationField
                    sx={{ width: '98%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/blobDetectorParams/distance_thresh',
                    }}
                    disabled={loading}
                    max={marks[1].value}
                    min={0}
                    valueLabelDisplay="auto"
                    marks={marks}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    How similar a finding and a blob needs to be to be
                    considered the same
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This allows a margin of error to be left between the
                    findings of a blob
                </Typography>
                <SliderConfigurationField
                    sx={{ width: '98%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/blobDetectorParams/similarity_threshold',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0%',
                        },
                        {
                            value: 1,
                            label: '100%',
                        },
                    ]}
                    valueLabelFormat={(v: number) =>
                        ((v * 100).toFixed(2) + '%').replace('.00', '')
                    }
                    max={1}
                    min={0}
                    step={0.025}
                    valueLabelDisplay="auto"
                />
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    Initial and Maximum life of a blob, in number of frames
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    When a blob disappears from view, we wait a certain time
                    until it reappears, if this time expires we forget it.
                </Typography>
                <SliderConfigurationField
                    sx={{ width: '98%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/blobDetectorParams/blob_max_life',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: cameraDefaults.fps,
                            label: 'Camera FPS',
                        },
                        {
                            value: cameraDefaults.fps * 5,
                            label: '5 x FPS',
                        },
                    ]}
                    max={cameraDefaults.fps * 5}
                    min={0}
                    step={1}
                    valueLabelDisplay="auto"
                    disabled={loading}
                />
            </Grid>
        </Grid>
    );
}