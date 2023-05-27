import {
    AppBar,
    Box,
    Button,
    Dialog,
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
    useMediaQuery,
    useTheme,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import config from '../../config';
import { useConfiguration } from '../../context/configurationContext';
import HttpClient from '../../Http/HttpClient';
import processPromise from '../../Http/ProcessPromise';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import CameraFrameBox from '../CameraFrameBox';
import { HelpPopover, InfoTextPopover } from '../IconPopover';
import LiveViewBox from '../LiveViewBox';
import {
    SelectConfigurationField,
    SliderConfigurationField,
    TextConfigurationField,
} from './configurationField';
import ROICanvasInputField from './Fields/ROICanvasInputField';

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
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();
    const theme = useTheme();

    const [cameraResize, setCameraResize] = useState<Size>({
        width: 0,
        height: 0,
    });

    const [showModalROI, setShowModalROI] = useState<boolean>(false);

    // used to reload the ROI displayed when we know it changed
    const [roiForceUpdate, setRoiForceUpdate] = useState<number>(0);

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    useEffect(() => {
        const promise = getFieldCB(`cameras/${commonData.camera}/resizeTo`)
            .ok((res: Size) => setCameraResize(res))
            .fail(e => console.error("Couldn't get camera resize to: ", e))
            .cancelled(() =>
                console.debug('cancelled camera image at detection'),
            );

        return () => {
            promise.cancel();
        };
    }, [commonData.camera, getFieldCB]);

    const refModalRoi = React.createRef<HTMLDivElement>();

    // i do not know why but useMediaQuery(theme.breakpoints.up('md')) returns false
    // the first time and then true, so i will keep using screen width instead
    const isBiggerThanMD = screen.width >= 900; // by default md is 900

    const GetROIprops = (cfg: {
        enableEditing: boolean;
        fullScreen: boolean;
    }) => {
        // Don't scale it bigger than 640x360 because it's inside a grid item.
        // if we know it wont fit use the remaining space and calculate the height
        // to keep the image ratio
        const fitInScreenWithRatio169 = {
            width: isBiggerThanMD ? 640 : screen.width * 0.5,
            height: isBiggerThanMD ? 360 : (screen.width * 0.5) / (16 / 9),
        };

        const verticalScreen = screen.height > screen.width;

        // if it's a horizontal screen it's important that it fits in the screen
        // without scrolling, that is why the width is calculated from the height
        // if it's not then it should fit in the x axis
        const fullScreenSize = {
            width: verticalScreen ? screen.width : screen.height * (16 / 9),
            height: verticalScreen ? screen.width / (16 / 9) : screen.height,
        };

        return {
            camera_id: params?.camera_id,
            updateCB: updateCB,
            getFieldCB: getFieldCB,
            fieldPath: 'processingConfiguration/roi',
            enableEditing: cfg.enableEditing,
            canvasSize: cfg.fullScreen
                ? fullScreenSize
                : fitInScreenWithRatio169,
            fullScreen: cfg.fullScreen,
        };
    };

    const OpenFullScreenRoiModal = () => {
        setShowModalROI(true);
    };

    const ExitFullScreenRoiModal = () => {
        setShowModalROI(false);
        document.exitFullscreen();
        setRoiForceUpdate(roiForceUpdate + 1);
    };

    return (
        <Grid container spacing={{ xs: 2, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
                <Typography
                    variant="body2"
                    color={'GrayText'}
                    sx={{ mb: '10px' }}>
                    Minimum amount of pixel that changed to trigger a validator
                    Used only as the initial value so you can set it to a big
                    number and it will average in some time.
                </Typography>

                <TextConfigurationField
                    label="Initial Minimum Change Threshold"
                    variant="standard"
                    type="number"
                    fullWidth
                    data={{ ...commonData, path: 'minimumChangeThreshold' }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
                <Typography
                    variant="body2"
                    color={'GrayText'}
                    sx={{ mb: '10px' }}>
                    When a new mean is calculated, the threshold is increased to
                    leave a margin between normal and non-normal pixel
                    difference.
                </Typography>

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
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <Box>
                    <Typography gutterBottom>
                        Video scale at processing stage
                        <InfoTextPopover
                            text="This resize will be applied after the last resize in the basics configuration.
                                    <br>So you can leave as it is by setting the same values or downscale it even more."
                        />
                    </Typography>

                    <Typography
                        variant="body2"
                        color={'GrayText'}
                        sx={{ mb: '10px' }}>
                        This can help reduce CPU overhead because all
                        transformation algorithms will be applied to a frame
                        resized to this size. This does not affect notifications
                        or output.
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

                <Box sx={{ mt: '20px' }}>
                    <Typography gutterBottom>Noise Threshold</Typography>

                    <Typography
                        variant="body2"
                        color={'GrayText'}
                        sx={{ mb: '10px' }}>
                        This field helps to improve detection accuracy. A large
                        value ({'>'} 50) may cause the system to miss some
                        events, and too small a value ({'<'} 30) may cause it to
                        analyze false positives, resulting in wasted CPU time.
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

            <Grid
                item
                xs={12}
                sm={12}
                md={8}
                sx={{ overscrollBehavior: 'none' }}>
                <Typography gutterBottom>
                    Camera region of interest
                    {!isBiggerThanMD && (
                        <Button onClick={OpenFullScreenRoiModal}>Edit</Button>
                    )}
                    {isBiggerThanMD && (
                        <Typography
                            sx={{ pl: '10px' }}
                            variant="overline"
                            color="GrayText">
                            Drag in the image to edit it
                        </Typography>
                    )}
                </Typography>
                <Typography
                    variant="body2"
                    color={'GrayText'}
                    sx={{ mb: '10px' }}>
                    Only movements/changes within this area will trigger us to
                    check whether something relevant has moved or not.
                </Typography>
                <ROICanvasInputField
                    key={roiForceUpdate}
                    {...GetROIprops({
                        enableEditing: isBiggerThanMD,
                        fullScreen: false,
                    })}
                />

                {/* Full screen modal for mobile users */}
                <Dialog
                    fullScreen
                    open={showModalROI}
                    ref={refModalRoi}
                    sx={{ overflow: 'hidden', touchAction: 'none' }}>
                    <ROICanvasInputField
                        {...GetROIprops({
                            enableEditing: true,
                            fullScreen: true,
                        })}
                        onRoiSelected={ExitFullScreenRoiModal}
                    />
                </Dialog>
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
