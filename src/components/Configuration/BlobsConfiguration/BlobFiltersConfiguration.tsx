import { Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useConfiguration } from '../../../context/configurationContext';
import { Size } from '../../../Geometry';
import CanvasDisplayBlobDistanceThreshold from '../../../modules/CanvasDisplayBlobDistanceThreshold';
import { DTOCameraDefaults } from '../../../services/api/interfaces/DTOCamera';
import { cameraService } from '../../../services/api/Services';
import { SliderConfigurationField } from '../configurationField';

export default function BlobFiltersConfiguration() {
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
            label: '0s (skip)',
        },
        {
            value: cameraDefaults.fps,
            label: `1s (${cameraDefaults.fps} frames)`,
        },
        {
            value: cameraDefaults.fps * 3,
            label: '3s',
        },
    ];

    const formatLabelFramesToTime = (v: number) => {
        let time = v / cameraDefaults.fps;
        const unit = /*time < 1 ? 'ms' :*/ 's';

        //if (time < 1) time *= 1000;

        const formatted = (time.toFixed(2) + unit).replace('.00', '');

        return `${formatted} (${v} frames)`;
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography>
                    Number of times a blob must appear in the event to be
                    considered part of it
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    If this values is equal to the camera FPS, then it must
                    appear at least in 1 second in total
                </Typography>
                <Typography variant="overline" color={'GrayText'} gutterBottom>
                    CAMERA FRAMES PER SECOND IS {cameraDefaults.fps}
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }} // leave margin -> big labels
                    data={{
                        ...commonData,
                        path: 'blobDetection/blobFilters/MinimumOccurrences',
                    }}
                    disabled={loading}
                    max={marks[2].value}
                    min={0}
                    valueLabelFormat={formatLabelFramesToTime}
                    valueLabelDisplay="auto"
                    marks={marks}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    Minimum total distance traveled by the blob to be considered
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This field is measured in % of the frame diagonal, so if
                    it's 100, each blob must travel the equivalent length of the
                    frame diagonal to be considered.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }} // leave margin -> big labels
                    data={{
                        ...commonData,
                        path: 'blobDetection/blobFilters/MinimumUnitsTraveled',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0 (skip)',
                        },
                        {
                            value: 100,
                            label: '100% (a diagonal length)',
                        },
                        {
                            value: 200,
                            label: '200%',
                        },
                    ]}
                    max={200}
                    min={0}
                    step={1}
                    valueLabelFormat={(v: number) => v + '%'}
                    valueLabelDisplay="auto"
                />
            </Grid>
            {/* TODO: VELOCITY FILTER, DO WE EVEN USE IT? */}
        </Grid>
    );
}
