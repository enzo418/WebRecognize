import { CloseFullscreen } from '@mui/icons-material';
import { Box, Button, Dialog, Grid, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useConfiguration } from '../../context/configurationContext';
import { HelpPopover } from '../IconPopover';
import InfoCard from '../InfoCard';
import MasksCanvasInputField from './Fields/MasksCanvasInputField';
import {
    SliderConfigurationField,
    TextConfigurationField,
} from './configurationField';

export default function AreasCameraConfiguration() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const [showModalMasks, setShowModalMasks] = useState<boolean>(false);

    // used to reload the masks displayed when we know it changed
    const [masksForceReload, setMasksForceReload] = useState<number>(0);

    const refModalMasks = React.createRef<HTMLDivElement>();

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    const isBiggerThanMD = screen.width >= 900; // by default md is 900

    // Don't scale it bigger than 640x360 because it's inside a grid item.
    // if we know it wont fit use the remaining space and calculate the height
    // to keep the image ratio
    const fitInScreenWithRatio169 = {
        width: isBiggerThanMD ? 640 : screen.width * 0.5,
        height: isBiggerThanMD ? 360 : (screen.width * 0.5) / (16 / 9),
    };

    const biggestSize = {
        width: screen.width,
        height: screen.height,
    };

    const getMaskCommonProps = () => ({
        camera_id: params?.camera_id,
        updateCB: updateCB,
        getFieldCB: getFieldCB,
        fieldPath: 'processingConfiguration/masks',
    });

    const onMasksUpdated = () => {
        setMasksForceReload(masksForceReload + 1);
    };

    const onMasksExit = () => {
        setShowModalMasks(false);
        document.exitFullscreen();
    };

    const maxSensibility = 100;

    return (
        <Grid container spacing={{ xs: 2, md: 2 }}>
            <Grid item xs={12} md={12} sx={{ mb: '40px' }}>
                <Typography gutterBottom>Sensibility</Typography>

                <Typography
                    variant="body2"
                    color={'GrayText'}
                    sx={{ mb: '10px' }}>
                    This field helps to improve detection accuracy. Low
                    sensibility value ({'<'} 40%) may cause the system to miss
                    some events, and value too large ({'>'} 80%) may cause it to
                    analyze false positives, resulting in wasted CPU time.
                </Typography>

                <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                    {/* NOTE: IT'S REVERSED for ease of use. */}
                    <SliderConfigurationField
                        sx={{ margin: '0 5%', width: '90%' }}
                        data={{
                            ...commonData,
                            path: 'processingConfiguration/noiseThreshold',
                            beforeSendValue: (v: number) => maxSensibility - v,
                        }}
                        marks={[
                            {
                                value: 0,
                                label: 'disable detection',
                            },
                            {
                                value: 55,
                                label: 'recommended',
                            },
                            {
                                value: maxSensibility,
                                label: 'MAX',
                            },
                        ]}
                        max={maxSensibility}
                        min={0}
                        step={1}
                        valueLabelFormat={(v: number) => v + '%'}
                        valueLabelDisplay="auto"
                    />
                </Stack>
            </Grid>

            <Grid item xs={12} sx={{ overscrollBehavior: 'none' }}>
                <Typography>
                    Detection zones
                    <Typography
                        variant="body2"
                        color={'GrayText'}
                        sx={{ mb: '10px' }}>
                        This allows you to select which parts of the camera you
                        want to ignore so that it doesn't trigger notifications,
                        it could be a tree, a rope, or anything that moves
                        repeatedly and you don't mind receiving notifications
                        about it.
                    </Typography>
                    <InfoCard>
                        <Typography variant="body2">
                            Note: You will be able to add new ones by placing
                            points on the image forming a polygon and joining
                            its ends, once you do this it will be saved
                            automatically.
                        </Typography>
                    </InfoCard>
                    <Button onClick={() => setShowModalMasks(true)}>
                        Edit{' '}
                    </Button>
                    <Typography variant="overline" color="GrayText">
                        click on <CloseFullscreen sx={{ fontSize: '1rem' }} />{' '}
                        to exit edit mode
                    </Typography>
                </Typography>

                <MasksCanvasInputField
                    key={masksForceReload}
                    {...getMaskCommonProps()}
                    enableEditing={false}
                    fullScreen={false}
                    onMasksUpdated={() => {}}
                    canvasSize={fitInScreenWithRatio169}
                />
            </Grid>

            {/* Full screen modal for mobile users */}
            <Dialog
                fullScreen
                open={showModalMasks}
                ref={refModalMasks}
                sx={{
                    overflow: 'hidden',
                    touchAction: 'none',
                }}>
                <MasksCanvasInputField
                    {...getMaskCommonProps()}
                    enableEditing={true}
                    fullScreen={true}
                    onMasksUpdated={onMasksUpdated}
                    showButtons={true}
                    canvasSize={biggestSize}
                    onExit={onMasksExit}
                />
            </Dialog>
        </Grid>
    );
}
