import { PlayCircleOutline } from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useConfiguration } from '../../../context/configurationContext';
import { getLocal, getLocalObject, Key, saveLocal } from '../../../LocalStore';
import DTOVideoBuffer from '../../../services/api/interfaces/DTOVideoBuffer';
import { videoBufferService } from '../../../services/api/Services';
import ProcessingRoom from '../../ProcessingRoom';
import { SliderConfigurationField } from '../configurationField';

export default function BlobThresholdParametersConfiguration() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const [searchParams, _] = useSearchParams();

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    const [availableBuffers, setAvailableBuffers] = useState<
        DTOVideoBuffer[] | null
    >(null);

    const lastVideoBufferID = useMemo<string | null>(() => {
        const lastBuffer = getLocalObject(Key.LAST_DEBUG_BUFFER);

        if (lastBuffer && lastBuffer.camera_id == params?.camera_id) {
            return lastBuffer.id;
        }

        return null;
    }, [params?.id, params?.camera_id]);

    const [videoBufferID, setVideoBufferID] = useState<string>(
        searchParams.get('videoBufferID') || lastVideoBufferID || '',
    );

    useEffect(() => {
        videoBufferService
            .getAvailable(commonData.camera)
            .ok(res => setAvailableBuffers(res))
            .fail(e =>
                console.error('Could not get available video buffers: ', e),
            );
    }, []);

    const createNewBuffer = () => {
        videoBufferService
            .createBuffer({
                camera_id: commonData.camera,
                delay: 0,
                duration: 5,
                resize: {
                    width: 640,
                    height: 360,
                },
            })
            .ok((buffer: DTOVideoBuffer) => {
                setAvailableBuffers([...(availableBuffers || []), buffer]);

                setVideoBufferID(buffer.id);
            })
            .fail(e => {
                toast.error('Could not create the buffer: ' + e.title);
                console.error('could not create the buffer: ', e);
            });
    };

    const onSelectBuffer = (ev: any) => {
        const id = ev.target.value as string;
        if (id == 'new') {
            createNewBuffer();
        } else {
            setVideoBufferID(id);
        }
    };

    const selected = availableBuffers?.filter(b => b.id == videoBufferID);

    const onDelete = () => {
        const id = videoBufferID;

        setVideoBufferID('');

        setAvailableBuffers(availableBuffers?.filter(b => b.id != id) || null);
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography>
                    Frames to wait before taking another difference frame
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    Note: A "difference frame" is a frame that has only the
                    changes or differences between two frames.
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This field allows the changes to be "amplified" a little
                    more, by taking more separate frames the difference will be
                    greater and the movement more descriptive, since there are
                    milliseconds between frames. Therefore, it depends on the
                    camera but a few frames (2 ~ 8) can improve the result.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/FramesBetweenDiffFrames',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 30,
                            label: '30',
                        },
                    ]}
                    max={30}
                    min={0}
                    step={1}
                    valueLabelFormat={(v: number) => v + ' frames'}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography>Context Frames</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This improves the accuracy of the system, because after
                    getting the difference frames (top field), each one will
                    have this amount of previous frames added to it to give it
                    context (again, because the time between frames is too small
                    to capture descriptive motion).
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/ContextFrames',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 30,
                            label: '30',
                        },
                    ]}
                    max={30}
                    min={0}
                    step={1}
                    valueLabelFormat={(v: number) => v + ' frames'}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography>Average blur kernel size</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    When processing difference frames, filters will be applied
                    to group small changes
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/MedianBlurKernelSize',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 100,
                            label: '100',
                        },
                    ]}
                    max={100}
                    min={0}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography gutterBottom>Gaussian blur kernel size</Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/GaussianBlurKernelSize',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 100,
                            label: '100',
                        },
                    ]}
                    max={100}
                    min={0}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography gutterBottom>Dilation size</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    After the filters, 2 transformations are applied, eroding
                    and dilating the frames, eliminating noise and small changes
                    that were not grouped because they did not have neighbors.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/DilationSize',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 100,
                            label: '100',
                        },
                    ]}
                    max={100}
                    min={0}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Typography gutterBottom>Brightness above threshold</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    How much times brighter a pixels needs to be to be
                    considered useful
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/thresholdParams/BrightnessAboveThreshold',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 10,
                            label: '10',
                        },
                    ]}
                    max={10}
                    min={0}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </Grid>

            <Grid item xs={12}>
                <Divider />
                <Typography
                    variant="overline"
                    fontSize={'1.15rem'}
                    className="centered">
                    Show modifications result in real time
                </Typography>
            </Grid>

            <Grid item xs={12}>
                {/* making request to get camera buffers */}
                {availableBuffers == null && (
                    <Box className="centered">
                        <LinearProgress
                            sx={{ width: '80%', padding: '3px 5%' }}
                        />
                    </Box>
                )}

                {/* no buffers for this camera  */}
                {availableBuffers !== null && availableBuffers.length == 0 && (
                    <Box className="centered">
                        <Typography>
                            There are no buffers for this camera
                        </Typography>
                        <Button
                            startIcon={<PlayCircleOutline color="success" />}
                            onClick={createNewBuffer}>
                            Record new buffer
                        </Button>
                    </Box>
                )}

                {availableBuffers !== null && availableBuffers.length > 0 && (
                    <>
                        <FormControl fullWidth sx={{ pb: '10px' }}>
                            <InputLabel id="select-buffer">
                                Select buffer
                            </InputLabel>
                            <Select
                                labelId="select-buffer"
                                value={videoBufferID}
                                label="Select buffer"
                                onChange={onSelectBuffer}>
                                {availableBuffers.map(b => (
                                    <MenuItem key={b.id} value={b.id}>
                                        <Typography
                                            variant="overline"
                                            color="GrayText">
                                            Date
                                        </Typography>
                                        <Typography
                                            variant="overline"
                                            sx={{ margin: 'auto 5px' }}>
                                            {format(
                                                new Date(b.date_unix * 1000),
                                                'dd MMMM yyyy HH:mm',
                                            )}
                                        </Typography>
                                        <Typography
                                            variant="overline"
                                            color="GrayText">
                                            Duration
                                        </Typography>
                                        <Typography
                                            variant="overline"
                                            sx={{ margin: 'auto 5px' }}>
                                            {b.duration} seconds
                                        </Typography>
                                    </MenuItem>
                                ))}
                                {videoBufferID.length > 0 && (
                                    <MenuItem value="new">
                                        <Button
                                            startIcon={
                                                <PlayCircleOutline color="success" />
                                            }
                                            onClick={createNewBuffer}>
                                            Record new buffer
                                        </Button>
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        {videoBufferID.length == 0 && (
                            <Box className="centered" sx={{ pb: '10px' }}>
                                <Button
                                    startIcon={
                                        <PlayCircleOutline color="success" />
                                    }
                                    onClick={createNewBuffer}>
                                    Record new buffer
                                </Button>
                            </Box>
                        )}
                    </>
                )}

                {/* buffer selected */}
                {availableBuffers !== null &&
                    videoBufferID.length > 0 &&
                    selected && (
                        <ProcessingRoom
                            bufferID={videoBufferID}
                            onDelete={onDelete}
                        />
                    )}
            </Grid>
        </Grid>
    );
}
