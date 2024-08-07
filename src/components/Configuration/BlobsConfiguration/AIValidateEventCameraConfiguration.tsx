import {
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    FormControlLabel,
    Grid,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import InfoCard from '../../InfoCard';
import {
    SliderConfigurationField,
    SwitchConfigurationField,
    TextConfigurationField,
} from '../configurationField';
import { useConfiguration } from '../../../context/configurationContext';
import { useEffect, useState } from 'react';
import { cameraService, aiServerService } from '../../../services/api/Services';
import { DTOCameraDefaults } from '../../../services/api/interfaces/DTOCamera';
import { DTOAIServer } from '../../../services/api/interfaces/DTOAIServer';

import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ComputerIcon from '@mui/icons-material/Computer';
import React from 'react';
import { Preview } from '@mui/icons-material';

//import { Refresh as RefreshIcon, Computer } from '@mui/icons-material';

export default function AIValidateEventCameraConfiguration() {
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

    const [aiServer, setAiServer] = useState<DTOAIServer | null>(null);
    const [searchingAiServer, setSearchingAiServer] = useState<boolean>(false);

    const [showMaskedFrame, setShowMaskedFrame] = useState<boolean>(false);
    const [maskedFrame, setMaskedFrame] = useState<string>('');

    const id = params?.camera_id;

    let promise: any;

    useEffect(() => {
        setLoading(true);

        promise = cameraService
            .getDefaults(id)
            .ok(v => {
                setCameraDefaults(v);
                setLoading(false);
            })
            .fail(e => console.error('could not get camera defaults', e))
            .cancelled(() => console.debug('cancelled params defaults'))
            .finally(() => handleFindServer());

        return () => {
            promise.cancel();

            if (maskedFrame.length > 0) {
                URL.revokeObjectURL(maskedFrame);
            }
        };
    }, []);

    const handleFindServer = () => {
        setSearchingAiServer(true);

        promise = aiServerService
            .findAnyService()
            .ok(server => {
                setAiServer(server);
            })
            .fail(e => setAiServer(null))
            .cancelled(() => console.debug('cancelled findAnyService'))
            .finally(() => setSearchingAiServer(false));
    };

    let refModalMasks = React.createRef<HTMLDivElement>();

    const onShowMaskedFrame = () => {
        promise = cameraService
            .getMaskedFrame(id)
            .ok(blob => {
                let url = URL.createObjectURL(blob);
                setMaskedFrame(url);
                setShowMaskedFrame(true);
            })
            .fail(e => console.error('could not get masked frame', e))
            .cancelled(() => console.debug('cancelled masked frame'));
    };

    const onImageLoaded = () => {};

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
                        Inference server instance
                    </Typography>
                    <Typography variant="body2" color={'GrayText'} gutterBottom>
                        The server will be found automatically if it is running
                        when needed. You can press the button below to verify if
                        the server is running.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={handleFindServer}>
                        Search for AI Server
                    </Button>
                    {searchingAiServer && (
                        <Box display="flex" alignItems="center" mt={2}>
                            <CircularProgress size={24} />
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                ml={2}>
                                Searching for server...
                            </Typography>
                        </Box>
                    )}
                    {!searchingAiServer && aiServer ? (
                        <Typography
                            variant="body2"
                            color="green"
                            gutterBottom
                            mt={2}>
                            <CheckCircleIcon
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '8px',
                                }}
                            />
                            Server found: {aiServer.hostname}
                        </Typography>
                    ) : (
                        !searchingAiServer && (
                            <Typography
                                variant="body2"
                                color="error"
                                gutterBottom
                                mt={2}>
                                <ErrorIcon
                                    style={{
                                        verticalAlign: 'middle',
                                        marginRight: '8px',
                                    }}
                                />
                                Server not found. Please ensure the server is
                                running and try again.
                            </Typography>
                        )
                    )}
                    <Typography variant="body2" color={'GrayText'} gutterBottom>
                        Otherwise you can manually enter the address of the
                        inference server below. It should be in the format{' '}
                        {'<ip>:<port>'}, for example localhost:50051
                    </Typography>
                    <TextConfigurationField
                        label="Server Address"
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

            <Grid item xs={12} sm={12} md={12}>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header">
                        Advanced
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack direction={'column'} spacing={2}>
                            <div>
                                <Typography>Apply camera rotation</Typography>
                                <Typography
                                    variant="body2"
                                    color={'GrayText'}
                                    gutterBottom>
                                    If checked, before sending the frames to the
                                    AI, the frames will be rotated according to
                                    rotation specified in the "Basic" camera
                                    configuration.
                                </Typography>
                                <SwitchConfigurationField
                                    data={{
                                        ...commonData,
                                        path: 'objectDetectionValidatorConfig/applyRotation',
                                        defaultValue: false,
                                    }}
                                />
                            </div>

                            <div>
                                <Typography>Apply detection masks</Typography>
                                <Typography
                                    variant="body2"
                                    color={'GrayText'}
                                    gutterBottom>
                                    If checked, before sending the frames to the
                                    AI, the frames will be masked according to
                                    the masks specified in the "Detection"
                                    configuration.
                                </Typography>
                                <Stack
                                    direction="row"
                                    justifyContent={'space-between'}>
                                    <SwitchConfigurationField
                                        data={{
                                            ...commonData,
                                            path: 'objectDetectionValidatorConfig/applyMasks',
                                            defaultValue: false,
                                        }}
                                    />
                                    {/* Button show mask applied to frame (cameraService.GetMaskedFrame) */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Preview />}
                                        onClick={() => {
                                            onShowMaskedFrame();
                                        }}>
                                        Show masked frame
                                    </Button>
                                </Stack>
                            </div>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            <Dialog
                fullScreen
                open={showMaskedFrame}
                ref={refModalMasks}
                sx={{
                    overflow: 'hidden',
                    touchAction: 'none',
                }}>
                <Button onClick={() => setShowMaskedFrame(false)}>Close</Button>
                <img
                    src={maskedFrame}
                    onLoad={() => onImageLoaded()}
                    style={{
                        width: '100%',
                        height: 'calc(100% - 50px)',
                        objectFit: 'contain',
                    }}></img>
                {maskedFrame.length == 0 && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}
            </Dialog>
        </Grid>
    );
}
