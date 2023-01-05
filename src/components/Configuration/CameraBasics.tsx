import { DeleteForever } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
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

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { useConfiguration } from '../../context/configurationContext';
import eventBus from '../../EventBus';
import HttpClient from '../../Http/HttpClient';
import processPromise from '../../Http/ProcessPromise';
import { DTOCameraDefaults } from '../../services/api/interfaces/DTOCamera';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import {
    cameraService,
    configurationService,
} from '../../services/api/Services';
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

export default function CameraBasics() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const commonData = {
        getFieldCB,
        updateCB,
        camera: params?.camera_id,
        getInitialValue,
    };

    const [url, setUrl] = useState<string>('');

    const [showDeleteCameraDialog, setShowDeleteCameraDialog] =
        useState<boolean>(false);

    /* ------------------- CAMERA DEFAULTS ------------------ */
    const [cameraDefault, setCameraDefaults] = useState<DTOCameraDefaults>({
        fps: 0,
        size: { width: 0, height: 0 },
    });

    const liveViewContainerRef = React.createRef<HTMLDivElement>();

    const navigate = useNavigate();

    // Update camera defaults on url change
    useEffect(() => {
        if (url.length > 0) {
            cameraService
                .getDefaults(commonData.camera)
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

    const handleCloseDeleteDialog = () => setShowDeleteCameraDialog(false);

    const handleAcceptDeleteDialog = () => {
        configurationService
            .deleteCamera(params.id, commonData.camera)
            .ok(() => {
                eventBus.dispatch('removed-camera', { id: commonData.camera });
                handleCloseDeleteDialog();
                navigate(`/configuration/${params.id}/general/basics`);
            })
            .fail(e => console.error("Couldn't delete the camera: ", e));
    };

    const [calculatedWidth, setCalculatedWidth] = useState<string>('640px');

    useEffect(() => {
        if (liveViewContainerRef.current) {
            const parentW =
                liveViewContainerRef.current.getBoundingClientRect().width;
            setCalculatedWidth(Math.min(640, parentW) + 'px');
        }
    }, []);

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
                        onValueChanged: v =>
                            eventBus.dispatch('camera-name-changed', {
                                id: commonData.camera,
                                name: v,
                            }),
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
                        <Typography id="video-scale-slider">
                            Video scale
                            <WarningPopover text="This will also affect the resulting notification images/videos" />
                        </Typography>
                        <Typography
                            variant="body2"
                            color={'GrayText'}
                            sx={{ mb: '10px' }}>
                            Scales the images received from the camera to this
                            size. You can see the effect in the output video
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
                </Stack>
            </Grid>

            <Grid item xs={12} sm={12} md={8} ref={liveViewContainerRef}>
                <LiveViewBox
                    key={url} // update if url changed
                    style={{ width: calculatedWidth }}
                    camera_id={commonData.camera}
                    keepSkeletonOnError={true}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <Typography gutterBottom>
                    Video Validator Buffer Size
                    <WarningPopover
                        text='Longer video validator buffer might improve the detection result
                                                <br>but also will take longer and more memory. The memory problem 
                                                <br>can be "solved" by reducing the "video scale".'
                    />
                    <Typography
                        variant="body2"
                        color={'GrayText'}
                        sx={{ mb: '10px' }}>
                        How much frames to use to validate the change. For
                        example, if you want to validate an event 1 second
                        before and after the change, you need to set it to{' '}
                        <span className="equation">
                            1s: fps * 1 * 2 = {cameraDefault.fps} * 1 * 2 ={' '}
                            {cameraDefault.fps * 1 * 2}
                        </span>
                        , multiply by 2 because half will be used for pre and
                        half for post change. Precalculated for you{' '}
                        <span className="equation">
                            3s: {cameraDefault.fps * 1 * 2} * 3 ={' '}
                            {cameraDefault.fps * 3 * 2}
                        </span>{' '}
                        and{' '}
                        <span className="equation">
                            5s: {cameraDefault.fps * 1 * 2} * 5 ={' '}
                            {cameraDefault.fps * 5 * 2}
                        </span>
                    </Typography>
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
                    Camera frames per second (fps) is {`${cameraDefault.fps}`}
                </Typography>
            </Grid>

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
                    {/*<DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        It will be deleted forever
                    </DialogContentText>
                    </DialogContent>*/}
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
