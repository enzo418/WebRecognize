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
import { HelpPopover, WarningPopover } from '../IconPopover';
import LiveViewBox from '../LiveViewBox';
import {
    SelectConfigurationField,
    SliderConfigurationField,
    TextConfigurationField,
} from './configurationField';

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

interface DTOCameraDefaults {
    fps: number;
    size: { width: number; height: number };
}

export default function CameraBasics() {
    const { params, updateCB, getFieldCB } = useConfiguration();

    const commonData = { getFieldCB, updateCB, camera: params?.camera_id };

    const [url, setUrl] = useState<string>('');

    /* ------------------- CAMERA DEFAULTS ------------------ */
    const [cameraDefault, setCameraDefaults] = useState<DTOCameraDefaults>({
        fps: 0,
        size: { width: 0, height: 0 },
    });

    const client = new HttpClient(config.server);

    // Update camera defaults on url change
    useEffect(() => {
        if (url.length > 0) {
            processPromise<DTOCameraDefaults, IProblemJson>(
                client.get(config.endpoints.api.cameraDefaults, { uri: url }),
            )
                .ok(defaults => {
                    setCameraDefaults(defaults);
                })
                .fail(e =>
                    console.error(
                        `Couldn't get camera defaults: ${e.title}`,
                        e,
                    ),
                );
        }
    }, [url]);

    return (
        <Grid container spacing={{ xs: 2, md: 2 }}>
            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    label="name"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'name',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <TextConfigurationField
                    label="url"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'url',
                        onValueChanged: v => setUrl(v),
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <Stack spacing={{ xs: 2, md: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="camera-type">Type</InputLabel>
                        <SelectConfigurationField
                            labelId="camera-type"
                            label="Type"
                            data={{ ...commonData, path: 'type' }}>
                            <MenuItem value={'Disabled'}>Disabled</MenuItem>
                            <MenuItem value={'Notificator'}>
                                Notificator
                            </MenuItem>
                            <MenuItem value={'View'}>View</MenuItem>
                        </SelectConfigurationField>
                    </FormControl>

                    <TextConfigurationField
                        label="Output rotation (degrees)"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{ ...commonData, path: 'rotation' }}
                    />

                    <Box>
                        <Typography id="video-scale-slider" gutterBottom>
                            Video scale
                            <HelpPopover
                                text="Scales the images received from the camera to this size.
                                    <br>You can see the effect in the output video"
                            />
                            <WarningPopover text="This will also affect the resulting notification images/videos" />
                        </Typography>

                        <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                            <TextConfigurationField
                                label="Scale Width"
                                variant="standard"
                                type="number"
                                fullWidth
                                data={{ ...commonData, path: 'resizeTo/width' }}
                            />

                            <TextConfigurationField
                                label="Scale Height"
                                variant="standard"
                                type="number"
                                fullWidth
                                data={{
                                    ...commonData,
                                    path: 'resizeTo/height',
                                }}
                            />
                        </Stack>
                        <Typography variant="overline" color="GrayText">
                            Camera resolution{' '}
                            {`W ${cameraDefault.size.width} x H ${cameraDefault.size.height}`}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography gutterBottom>
                            Video Validator Buffer Size
                            <HelpPopover
                                text="How much frames to use to validate the change.
                                    <br>For example, if you want to validate an event in the 3 seconds
                                    <br>before and after the change, you need to set it to fps * 3 * 2,
                                    <br>multiply by 2 because half will be used for pre and half for post change."
                            />
                            <WarningPopover
                                text='Longer video validator buffer might improve the detection result
                                                <br>but also will take longer and more memory. The memory problem 
                                                <br>can be "solved" by reducing the "video scale".'
                            />
                        </Typography>
                        <Stack direction="row">
                            <TextConfigurationField
                                label=""
                                variant="standard"
                                type="number"
                                fullWidth
                                data={{
                                    ...commonData,
                                    path: 'videoValidatorBufferSize',
                                }}
                            />
                        </Stack>
                        <Typography variant="overline" color="GrayText">
                            Camera frames per second (fps) is{' '}
                            {`${cameraDefault.fps}`}
                        </Typography>
                    </Box>
                </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <LiveViewBox
                    style={{ width: '640px' }}
                    uri={url}
                    keepSkeletonOnError={true}
                />
            </Grid>
        </Grid>
    );
}
