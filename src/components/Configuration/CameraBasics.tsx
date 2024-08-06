import { DeleteForever } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Slider,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import {
    ConfigurationContextType,
    useConfiguration,
} from '../../context/configurationContext';
import eventBus from '../../EventBus';
import HttpClient from '../../Http/HttpClient';
import processPromise from '../../Http/ProcessPromise';
import { DTOCameraDefaults } from '../../services/api/interfaces/DTOCamera';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import {
    cameraService,
    configurationService,
} from '../../services/api/Services';
import { HelpPopover, InfoTextPopover } from '../IconPopover';
import LiveViewBox from '../LivewView/LiveViewBox';
import {
    SelectConfigurationField,
    SliderConfigurationField,
    TextConfigurationField,
} from './configurationField';
import { Key, getLocalDefault, saveLocal } from '../../LocalStore';
import { getFieldValue, setFieldValue } from '../../utils/configurationFields';
import { Size } from '../../Geometry';

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

export default function CameraBasics() {
    const context = useConfiguration();

    const commonData = {
        getFieldCB: context.getFieldCB,
        updateCB: context.updateCB,
        camera: context.params?.camera_id,
        getInitialValue: context.getInitialValue,
    };

    const [url, setUrl] = useState<string>('');

    const [showDeleteCameraDialog, setShowDeleteCameraDialog] =
        useState<boolean>(false);

    const [showLiveView, setShowLiveView] = useState<boolean>(
        getLocalDefault<boolean>(Key.DEFAULT_SHOW_LIVE_VIEW, true),
    );

    const [videoBufferLength, setVideoBufferLength] = useState<number>(0);

    const [videoScale, setVideoScale] = useState<{
        width: number;
        height: number;
        ratio: number;
    }>({ width: 0, height: 0, ratio: 0.0 });

    const handleShowLiveViewChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setShowLiveView(event.target.checked);
        saveLocal(Key.DEFAULT_SHOW_LIVE_VIEW, event.target.checked);
    };

    const [calculatedWidth, setCalculatedWidth] = useState<string>('640px');

    /* ------------------- CAMERA DEFAULTS ------------------ */
    const [cameraDefault, setCameraDefaults] = useState<DTOCameraDefaults>({
        fps: 0,
        size: { width: 0, height: 0 },
    });

    const liveViewContainerRef = React.createRef<HTMLDivElement>();

    const navigate = useNavigate();

    // Update camera defaults on url change
    useEffect(() => {
        const calculateRatio = (defaults: Size) => {
            getFieldValue(context, 'resizeTo/width')
                .ok((w: number) => {
                    // resize to 0 means no resize.
                    if (w == 0) {
                        setVideoScale({
                            width: defaults.width,
                            height: defaults.height,
                            ratio: 1,
                        });
                    } else {
                        const storedRatio = w / defaults.width;

                        // calculate ratio
                        setVideoScale({
                            ...videoScale,
                            ratio: storedRatio,
                        });

                        // only downscale is allowed
                        if (storedRatio > 1) {
                            if (storedRatio > 1)
                                console.info(
                                    `Stored ratio is bigger than 1, setting to 1. Only downscale is allowed.`,
                                );

                            handleRatioChange(1);
                        }
                    }
                })
                .fail(e => console.error("Couldn't get width: ", e));
        };

        if (url.length > 0) {
            cameraService
                .getDefaults(commonData.camera)
                .ok(defaults => {
                    setCameraDefaults(defaults);
                    calculateRatio(defaults.size);
                })
                .fail(e =>
                    console.error(
                        `Couldn't get camera defaults: ${e.title}`,
                        e,
                    ),
                );
        }
    }, [url]);

    useEffect(() => {
        if (liveViewContainerRef.current) {
            const parentW =
                liveViewContainerRef.current.getBoundingClientRect().width;
            setCalculatedWidth(Math.min(640, parentW) + 'px');
        }
    }, []);

    const handleCloseDeleteDialog = () => setShowDeleteCameraDialog(false);

    const handleAcceptDeleteDialog = () => {
        configurationService
            .deleteCamera(context.params.id, commonData.camera)
            .ok(() => {
                eventBus.dispatch('removed-camera', { id: commonData.camera });
                handleCloseDeleteDialog();
                navigate(`/configuration/${context.params.id}/general/basics`);
            })
            .fail(e => console.error("Couldn't delete the camera: ", e));
    };

    const handleRatioChange = (ratio: number) => {
        const width = Math.round(cameraDefault.size.width * ratio);
        const height = Math.round(cameraDefault.size.height * ratio);

        setVideoScale({
            width,
            height,
            ratio,
        });

        const results = [
            setFieldValue(context, 'resizeTo/width', width),
            setFieldValue(context, 'resizeTo/height', height),
        ];

        return Promise.all(results);
    };

    return (
        <Grid container spacing={{ xs: 2, md: 2 }}>
            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    className="configuration-field"
                    label="name"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'name',
                        onValueChanged: v =>
                            eventBus.dispatch('camera-name-changed', {
                                id: commonData.camera,
                                name: v,
                            }),
                    }}
                />

                <Stack
                    className="configuration-field"
                    spacing={{ xs: 2, md: 2 }}>
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
                </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <TextConfigurationField
                    className="configuration-field"
                    label="url"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'url',
                        onValueChanged: v => setUrl(v),
                    }}
                />

                <TextConfigurationField
                    label="Output rotation counter clock wise (degrees)"
                    variant="standard"
                    className="configuration-field"
                    type="number"
                    fullWidth
                    data={{ ...commonData, path: 'rotation' }}
                />
            </Grid>

            <Grid item xs={12} className="configuration-field">
                <Typography id="video-scale-slider">
                    Video scale
                    <InfoTextPopover text="This will also affect the resulting notification images/videos" />
                </Typography>
                <Typography
                    variant="body2"
                    color={'GrayText'}
                    sx={{ mb: '10px' }}>
                    Scales the images received from the camera to this size. You
                    can see the effect in the output video
                </Typography>

                <Slider
                    aria-labelledby="video-scale-slider"
                    disabled={cameraDefault.size.width === 0}
                    value={videoScale.ratio}
                    sx={{ margin: '0 5%', width: '90%' }}
                    onChange={(e, v) => {
                        const ratio = v as number;
                        handleRatioChange(ratio);
                    }}
                    valueLabelFormat={v =>
                        `${Math.round(
                            cameraDefault.size.width * v,
                        )} x ${Math.round(cameraDefault.size.height * v)}`
                    }
                    valueLabelDisplay="auto"
                    marks={[
                        { value: 0.5, label: 'downscale 50%' },
                        { value: 1, label: 'no scaling' },
                    ]}
                    min={0.05}
                    max={1}
                    step={0.1}
                />

                <Typography variant="overline" color="GrayText">
                    Camera resolution{' '}
                    {`W ${cameraDefault.size.width} x H ${cameraDefault.size.height}`}
                </Typography>
            </Grid>

            {/* ------------------- VIDEO VALIDATOR BUFFER SIZE ------------------ */}
            <Grid item xs={12}>
                <Box className="configuration-field">
                    <Typography gutterBottom>
                        Video Validator Buffer Size
                        <InfoTextPopover
                            text='Longer video validator buffer might improve the detection result
                                                <br>but also will take longer and more memory. The memory problem 
                                                <br>can be "solved" by reducing the "video scale".'
                        />
                        <Typography
                            variant="body2"
                            color={'GrayText'}
                            sx={{ mb: '10px' }}>
                            This sets the video length that will be used to
                            validate the detected movement.
                        </Typography>
                    </Typography>
                    <SliderConfigurationField
                        sx={{ margin: '0 5%', width: '90%' }}
                        data={{
                            ...commonData,
                            path: 'videoValidatorBufferSize',
                            beforeSendValue: (v: number) => Math.round(v),
                            onValueChanged: (v: number) => {
                                setVideoBufferLength(v);
                            },
                        }}
                        marks={
                            cameraDefault.fps == 0
                                ? [
                                      {
                                          value: 0,
                                          label: '...',
                                      },
                                  ] // do this while loading
                                : [
                                      {
                                          value: cameraDefault.fps / 2,
                                          label: 'min',
                                      },
                                      {
                                          value: cameraDefault.fps * 5,
                                          label: '5s (recommended)',
                                      },
                                      {
                                          value: cameraDefault.fps * 30,
                                          label: 'max',
                                      },
                                  ]
                        }
                        max={cameraDefault.fps * 30}
                        min={cameraDefault.fps / 2}
                        step={0.5}
                        disabled={cameraDefault.fps == 0}
                        valueLabelFormat={(v: number) =>
                            `${(v / cameraDefault.fps).toFixed(2)} seconds`
                        }
                        valueLabelDisplay="auto"
                    />
                </Box>
            </Grid>

            {/* --------------------- LIVE VIEW -------------------- */}
            <Grid item xs={12} sm={12} md={8} ref={liveViewContainerRef}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showLiveView}
                            onChange={handleShowLiveViewChange}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                    }
                    label="Show live view"
                />

                {showLiveView && (
                    <LiveViewBox
                        key={url} // update if url changed
                        imageStyle={{
                            width: calculatedWidth,
                            borderRadius: '9px',
                            boxShadow: '0px 0px 2px 3px #0e0e11f7',
                        }}
                        source={{ cameraID: commonData.camera }}
                        keepSkeletonOnError={true}
                        onError={() => {}}
                    />
                )}
            </Grid>

            {/* --------------------- CAMERA INFO -------------------- */}
            <Grid item xs={12}>
                <Typography>Camera details</Typography>
                <Grid
                    container
                    spacing={{ xs: 2, md: 2 }}
                    sx={{
                        textAlign: 'center',
                    }}>
                    <Grid item xs={6}>
                        <Typography variant="overline" color="GrayText">
                            FPS
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="overline" color="GrayText">
                            {cameraDefault.fps}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="overline" color="GrayText">
                            Source Resolution (Width x Height)
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="overline" color="GrayText">
                            {`${cameraDefault.size.width} x ${cameraDefault.size.height}`}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="overline" color="GrayText">
                            Memory usage per buffer
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Tooltip title="depends on the video scale and buffer length">
                            <Typography variant="overline" color="GrayText">
                                {`${(
                                    (videoScale.width *
                                        videoScale.height *
                                        3 *
                                        videoBufferLength) /
                                    1024 /
                                    1024
                                ).toFixed(2)} MB`}
                            </Typography>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <Divider light />
            </Grid>

            {/* --------------------- DELETE CAMERA -------------------- */}
            <Grid item xs={12} sm={12} md={8}>
                <Button
                    variant="contained"
                    color="warning"
                    startIcon={<DeleteForever />}
                    onClick={() => setShowDeleteCameraDialog(true)}>
                    Delete camera
                </Button>

                <Dialog
                    open={showDeleteCameraDialog}
                    onClose={handleCloseDeleteDialog}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description">
                    <DialogTitle id="delete-dialog-title">
                        {'Delete camera?'}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} autoFocus>
                            Cancel
                        </Button>
                        <Button onClick={handleAcceptDeleteDialog}>YES</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
}
