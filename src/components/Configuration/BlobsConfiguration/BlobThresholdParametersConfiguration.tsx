import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useConfiguration } from '../../../context/configurationContext';
import { SliderConfigurationField } from '../configurationField';

export default function BlobThresholdParametersConfiguration() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography
                    textAlign={'center'}
                    color={'GrayText'}
                    sx={{ padding: '10px 0' }}>
                    <i>
                        This setting is usually only changed with a live stream
                        so that you can see what you are doing.
                    </i>
                </Typography>
            </Grid>

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
                        path: 'blobDetection/thresholdingParams/FramesBetweenDiffFrames',
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
                        path: 'blobDetection/thresholdingParams/ContextFrames',
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
                        path: 'blobDetection/thresholdingParams/MedianBlurKernelSize',
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
                        path: 'blobDetection/thresholdingParams/GaussianBlurKernelSize',
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
                        path: 'blobDetection/thresholdingParams/DilationSize',
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
                        path: 'blobDetection/thresholdingParams/BrightnessAboveThreshold',
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
        </Grid>
    );
}
