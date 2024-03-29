import { Box, FormControlLabel, Grid, Typography } from '@mui/material';
import InfoCard from '../../InfoCard';
import {
    SliderConfigurationField,
    SwitchConfigurationField,
    TextConfigurationField,
} from '../configurationField';
import { useConfiguration } from '../../../context/configurationContext';
import { useEffect, useState } from 'react';
import { cameraService } from '../../../services/api/Services';
import { DTOCameraDefaults } from '../../../services/api/interfaces/DTOCamera';

export default function BlobValidateObjectDetectedConfiguration() {
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

    const id = params?.camera_id;

    useEffect(() => {
        setLoading(true);

        const promise = cameraService
            .getDefaults(id)
            .ok(v => {
                setCameraDefaults(v);
                setLoading(false);
            })
            .fail(e => console.error('could not get camera defaults', e))
            .cancelled(() => console.debug('cancelled params defaults'));

        return () => {
            promise.cancel();
        };
    }, []);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography>
                    This configuration enables the automatic classification of
                    detections as valid or invalid based on the detected
                    objects. To make this functionality possible, an inference
                    server is necessary.
                </Typography>
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'objectDetectionValidatorConfig/enabled',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Enable object detection validation"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
                <Box>
                    <Typography gutterBottom>
                        Inference server address
                    </Typography>
                    <Typography variant="body2" color={'GrayText'} gutterBottom>
                        The address of the inference server. It should be in the
                        format {'<ip>:<port>'}, for example localhost:50051
                    </Typography>
                    <TextConfigurationField
                        label=""
                        variant="standard"
                        type="string"
                        fullWidth
                        data={{
                            ...commonData,
                            path: 'objectDetectionValidatorConfig/serverAddress',
                        }}
                    />
                </Box>
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
                <Typography>Confidence threshold</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    Minimum confidence for a detection to be considered valid,
                    usually between 0.4 and 0.9 depending on the camera.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 2%', width: '95%' }}
                    data={{
                        ...commonData,
                        path: 'objectDetectionValidatorConfig/confidenceThreshold',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 1,
                            label: '1',
                        },
                    ]}
                    max={1}
                    min={0}
                    step={0.05}
                    valueLabelFormat={(v: number) => v}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
                <Typography>Frames to send per second</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    How many frames to send to the inference server. For
                    example, if the camera FPS is 18, then 1 frame per second
                    means that 1 frame every 18 will be sent to the inference
                    server. The final number of frames sent will depend on the
                    buffer length selected at "Video Validator Buffer Size".
                </Typography>

                <SliderConfigurationField
                    sx={{ margin: '0 2%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'objectDetectionValidatorConfig/maxFramesPerSecond',
                    }}
                    marks={[
                        {
                            value: 1,
                            label: `1 every ${cameraDefaults.fps} frames`,
                        },
                        {
                            value: cameraDefaults.fps,
                            label: 'all',
                        },
                    ]}
                    max={cameraDefaults.fps}
                    min={0}
                    step={0.1}
                    valueLabelFormat={(v: number) =>
                        `1 every ${Math.ceil(
                            (1 / v) * cameraDefaults.fps,
                        )} frames`
                    }
                    valueLabelDisplay="auto"
                    disabled={loading}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
                <Typography>Minimum persons detected</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    A detection will be valid if the system detects more than
                    this number of persons over the entire length of the buffer.
                    Note that the same person in two different frames count as
                    2.
                </Typography>

                <TextConfigurationField
                    label=""
                    variant="standard"
                    type="number"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'objectDetectionValidatorConfig/minObjectCount/person',
                    }}
                />
            </Grid>
        </Grid>
    );
}
