import { CloseFullscreen } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    FormControlLabel,
    Grid,
    Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useConfiguration } from '../../../context/configurationContext';
import { Size } from '../../../Geometry';
import CanvasDisplayBlobDistanceThreshold from '../../../modules/CanvasDisplayBlobDistanceThreshold';
import CanvasDisplaySampleArea from '../../../modules/CanvasDisplaySampleArea';
import { DTOCameraDefaults } from '../../../services/api/interfaces/DTOCamera';
import { cameraService } from '../../../services/api/Services';
import {
    SliderConfigurationField,
    SwitchConfigurationField,
    TextConfigurationField,
} from '../configurationField';
import IgnoredSetsCanvasInputField from '../Fields/IgnoredSetsCanvasInputField';

export default function BlobContoursFiltersConfiguration() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const canvasAreaContainerRef = React.createRef<HTMLDivElement>();

    const id = { camera_id: params?.camera_id };

    const commonData = {
        getFieldCB,
        updateCB,
        getInitialValue,
        camera: params?.camera_id,
    };

    const [minArea, setMinArea] = useState<number>(0);
    const [canvasAreaSize, setCanvasAreaSize] = useState<Size>({
        width: 640,
        height: 360,
    });

    // ignored sets
    const [showModalSets, setShowModalSets] = useState<boolean>(false);
    const [forceReloadIgnoredSets, setForceReloadIgnoredSets] =
        useState<number>(0);
    const [canvasIgnoredSetsSize, setCanvasIgnoredSetsSize] = useState<Size>({
        width: 640,
        height: 360,
    });

    const ignoredSetsContainerRef = React.createRef<HTMLDivElement>();
    const refModalPolys = React.createRef<HTMLDivElement>();

    const isBiggerThanMD = screen.width >= 900; // by default md is 900

    const biggestSize = {
        width: screen.width,
        height: screen.height,
    };

    const getMaskCommonProps = () => ({
        camera_id: params?.camera_id,
        updateCB: updateCB,
        getFieldCB: getFieldCB,
        fieldPath: 'blobDetection/contoursFilters/ignoredSets/sets',
        referenceSizePath:
            'blobDetection/contoursFilters/ignoredSets/reference',
    });

    const onSetsChanged = () => {
        setForceReloadIgnoredSets(forceReloadIgnoredSets + 1);
    };

    const onSetsExit = () => {
        setShowModalSets(false);
        document.exitFullscreen();
    };

    // calculate canvas sizes
    useEffect(() => {
        const boundingRectArea: any = canvasAreaContainerRef.current
            ? canvasAreaContainerRef.current.getBoundingClientRect()
            : {};

        setCanvasAreaSize({
            width: boundingRectArea.width,
            height: boundingRectArea.width / 1.77,
        });

        // same for ignored sets
        const boundingRectSets: any = ignoredSetsContainerRef.current
            ? ignoredSetsContainerRef.current.getBoundingClientRect()
            : {};

        setCanvasIgnoredSetsSize({
            width: isBiggerThanMD ? 640 : boundingRectSets.width,
            height: isBiggerThanMD ? 360 : boundingRectSets.width / 1.77,
        });
    }, []);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography>
                    Minimum area that a finding (polygon describing the shape of
                    something that moved) must have in order not to be
                    discarded, in pixels.
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    The image below shows a visual sample of what the selected
                    area would look like. This field is used to eliminate noise
                    and very small findings such as bugs. Setting a high value
                    will cause findings far away from the lens to be eliminated.
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6} ref={canvasAreaContainerRef}>
                        <CanvasDisplaySampleArea
                            area={minArea}
                            canvasSize={canvasAreaSize}
                            autoGetImage={{ id: id }}
                        />
                    </Grid>
                    <Grid item xs md>
                        <Box sx={{ pl: '10px' }}>
                            <Typography gutterBottom>
                                Type the minimum area
                            </Typography>
                            <TextConfigurationField
                                label=""
                                variant="standard"
                                type="number"
                                fullWidth
                                data={{
                                    ...commonData,
                                    path: 'blobDetection/contoursFilters/MinimumArea',
                                    onValueChanged: v => setMinArea(v),
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Typography>Filter by average area</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    Each area must have a greater than average area to be
                    considered. This is useful to leave only the largest ones
                    but it has to be well combined with the above field.
                </Typography>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'blobDetection/contoursFilters/FilterByAverageArea',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Use this filter"
                />
            </Grid>
            <Grid item xs={12} ref={ignoredSetsContainerRef}>
                <Typography>Ignored areas</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    if a finding (contour/polygon) falls into any of these
                    areas, then we will disregard it.
                </Typography>

                <Stack direction="column">
                    <Box>
                        <Button onClick={() => setShowModalSets(true)}>
                            Edit{' '}
                        </Button>
                        <Typography variant="overline" color="GrayText">
                            click on{' '}
                            <CloseFullscreen sx={{ fontSize: '1rem' }} /> to
                            exit edit mode
                        </Typography>
                    </Box>

                    <IgnoredSetsCanvasInputField
                        key={forceReloadIgnoredSets}
                        {...getMaskCommonProps()}
                        enableEditing={false}
                        fullScreen={false}
                        onSetsUpdated={() => {}}
                        canvasSize={canvasIgnoredSetsSize}
                    />
                </Stack>

                {/* Full screen modal for mobile users */}
                <Dialog
                    fullScreen
                    open={showModalSets}
                    ref={refModalPolys}
                    sx={{
                        overflow: 'hidden',
                        touchAction: 'none',
                    }}>
                    <IgnoredSetsCanvasInputField
                        {...getMaskCommonProps()}
                        enableEditing={true}
                        fullScreen={true}
                        onSetsUpdated={onSetsChanged}
                        showButtons={true}
                        canvasSize={biggestSize}
                        onExit={onSetsExit}
                    />
                </Dialog>
            </Grid>
            <Grid item xs={12}>
                <Typography id="video-scale-slider">Reference</Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    <Box display={'inline'} color={'orange'}>
                        Once sets are selected you should not edit this field
                    </Box>
                    , it is used to convert the stored sets to arbitrary sizes
                    so when you change this field you must also change the sets
                    above or the system will read them differently than you
                    chose.
                </Typography>

                <Stack
                    direction="row"
                    spacing={{ xs: 1, md: 2 }}
                    sx={{ pt: '10px' }}>
                    <TextConfigurationField
                        label="Reference Width"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{
                            ...commonData,
                            path: 'blobDetection/contoursFilters/ignoredSets/reference/width',
                        }}
                    />

                    <TextConfigurationField
                        label="Reference Height"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{
                            ...commonData,
                            path: 'blobDetection/contoursFilters/ignoredSets/reference/height',
                        }}
                    />
                </Stack>
            </Grid>
            <Grid item xs={12}>
                <Typography>
                    Minimum percentage of intersecting area to ignore
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    Sometimes the object appears almost completely inside the
                    area to be ignored but not entirely, with this parameter you
                    allow it to be ignored if a certain % of it enters.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'blobDetection/contoursFilters/ignoredSets/minPercentageToIgnore',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: '0',
                        },
                        {
                            value: 100,
                            label: '100%',
                        },
                    ]}
                    max={100}
                    min={0}
                    step={1}
                    valueLabelFormat={(v: number) => v + '%'}
                    valueLabelDisplay="auto"
                />
            </Grid>
        </Grid>
    );
}
