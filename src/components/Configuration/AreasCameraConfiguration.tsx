import { CloseFullscreen } from '@mui/icons-material';
import { Box, Button, Dialog, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useConfiguration } from '../../context/configurationContext';
import { HelpPopover } from '../IconPopover';
import MasksCanvasInputField from './Fields/MasksCanvasInputField';

export default function AreasCameraConfiguration() {
    const { params, updateCB, getFieldCB } = useConfiguration();

    const [showModalMasks, setShowModalMasks] = useState<boolean>(false);

    // used to reload the masks displayed when we know it changed
    const [masksForceReload, setMasksForceReload] = useState<number>(0);

    const refModalMasks = React.createRef<HTMLDivElement>();

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

    return (
        <Box>
            <Typography></Typography>

            <Stack direction="column">
                <Typography>
                    Camera masks
                    <HelpPopover
                        text="This allows you to select which parts of the camera you want to
                <br>ignore so that it doesn't trigger notifications, it could be a
                <br>tree, a rope, or anything that moves repeatedly and you don't
                <br>mind receiving notifications about it."
                    />
                    <Typography variant="body2">
                        Note: You will be able to add new ones by placing points
                        on the image forming a polygon and joining its ends,
                        once you do this it will be saved automatically.
                    </Typography>
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
            </Stack>

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
        </Box>
    );
}
