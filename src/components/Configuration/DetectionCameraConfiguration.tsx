import {
    Box,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import config from '../../config';
import { useConfiguration } from '../../context/configurationContext';
import HttpClient from '../../Http/HttpClient';
import processPromise from '../../Http/ProcessPromise';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import CameraFrameBox from '../CameraFrameBox';
import { HelpPopover, WarningPopover } from '../IconPopover';
import LiveViewBox from '../LiveViewBox';
import {
    SelectConfigurationField,
    SliderConfigurationField,
    TextConfigurationField,
} from './configurationField';
import ROICanvasInputField from './ROICanvasInputField';

interface Props {
    updateField: (field: string, value: any) => any;
}

interface IConfigurationFieldProps {
    updateCB: any;
    params: any;
    name: string;
}

// function ConfigurationField(props:ConfigurationField) {
//    const {updateCB, params, name} = props;
//    const [error, setError] = useState()

//    return <TextField
//        label="name"
//        defaultValue={'test'}
//        variant="standard"
//        sx={{width: '100%'}}
//        onChange={(e) => updateCB(params, 'name', e.target.value)}
//    />;
// }

interface Size {
    width: number;
    height: number;
}

interface DTOCameraDefaults {
    fps: number;
    size: Size;
}

export default function DetectionCameraConfiguration() {
    const { params, updateCB, getFieldCB } = useConfiguration();

    const commonData = { getFieldCB, updateCB, camera: params?.camera_id };

    const [cameraResize, setCameraResize] = useState<Size>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        getFieldCB(`cameras/${commonData.camera}/resizeTo`)
            .ok((res: Size) => setCameraResize(res))
            .fail(e => console.error("Couldn't get camera resize to: ", e));
    }, [params?.camera_id]);

    return (
        <Grid container spacing={{ xs: 2, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
                <Stack direction="row">
                    <TextConfigurationField
                        label="Initial Minimum Change Threshold"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{ ...commonData, path: 'minimumChangeThreshold' }}
                    />

                    <HelpPopover
                        text="minimum amount of pixel that changed to trigger a validator
                            <br>Used only as the initial value so you can set it to a big number
                            <br>and it will average in some time."
                    />
                </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
                <Stack direction="row">
                    <TextConfigurationField
                        label="Increase Threshold Factor"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{
                            ...commonData,
                            path: 'increaseThresholdFactor',
                        }}
                    />

                    <HelpPopover
                        text="When a new mean is calculated, the threshold is increased
                            <br>to leave a margin between normal and non-normal pixel difference."
                    />
                </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <Box>
                    <Typography gutterBottom>
                        Video scale at processing stage
                        <HelpPopover
                            text="This can help reduce CPU overhead because all transformation algorithms
                                <br>will be applied to a frame resized to this size. This does not affect 
                                <br>notifications or output."
                        />
                        <WarningPopover
                            text="This resize will be applied after the last resize in the basics configuration.
                                    <br>So you can leave as it is by setting the same values or downscale it even more."
                        />
                    </Typography>

                    <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                        <TextConfigurationField
                            label="Scale Width"
                            variant="standard"
                            type="number"
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'processingConfiguration/resize/width',
                            }}
                        />

                        <TextConfigurationField
                            label="Scale Height"
                            variant="standard"
                            type="number"
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'processingConfiguration/resize/height',
                            }}
                        />
                    </Stack>
                    <Typography variant="overline" color="GrayText">
                        Previous stage resize was{' '}
                        {`W ${cameraResize.width} x H ${cameraResize.height}`}
                    </Typography>
                </Box>

                <Box>
                    <Typography gutterBottom>
                        Noise Threshold
                        <HelpPopover
                            text="This field helps to improve detection accuracy. 
                                <br>A large value (> 50) may cause the system to miss 
                                <br>some events, and too small a value (< 30) may cause
                                <br>it to analyze false positives, resulting in wasted CPU time."
                        />
                    </Typography>

                    <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                        <TextConfigurationField
                            label=""
                            variant="standard"
                            type="number"
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'processingConfiguration/noiseThreshold',
                            }}
                        />
                    </Stack>
                </Box>
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <Typography gutterBottom>Camera region of interest</Typography>
                <ROICanvasInputField
                    camera_id={params?.camera_id}
                    updateCB={updateCB}
                    getFieldCB={getFieldCB}
                    fieldPath="processingConfiguration/roi"
                />
            </Grid>
            {/* Not used in recognize */}
            {/*<Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                        label="Seconds Between Threshold Update"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{...commonData, path: 'secondsBetweenThresholdUpdate'}}
                />
            </Grid>*/}

            {/* Not used in recognize */}
            {/*<Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                        label="Save change in a video?"
                        variant="standard" 
                        type="number"
                        fullWidth
                        data={{...commonData, path: 'saveDetectedChangeInVideo'}}
                />
            </Grid>*/}

            {/* Not used in recognize */}
            {/*<Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                        label="Object Detection Method"
                        variant="standard" 
                        type="number"
                        fullWidth
                        data={{...commonData, path: 'objectDetectionMethod'}}
                />
            </Grid>*/}
        </Grid>
    );
}
