import { Box, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { useConfiguration } from '../../context/configurationContext';
import {
    SwitchConfigurationField,
    TextConfigurationField,
} from './configurationField';

export default function VideoOutputGeneral() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();
    const commonData = { getFieldCB, updateCB, getInitialValue };

    return (
        <Grid container spacing={{ xs: 2, md: 1 }}>
            <Grid item xs={12} sm={12} md={4}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'outputConfiguration/showOutput',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Show video output"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'outputConfiguration/showIgnoredAreas',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Show ignored areas in the output"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'outputConfiguration/showProcessedFrames',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Show processed frames in the output"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
                <Box>
                    <Typography id="video-scale-slider" gutterBottom>
                        Video output resolution
                    </Typography>

                    <Stack direction="row" spacing={{ xs: 1, md: 2 }}>
                        <TextConfigurationField
                            label="Scale Width"
                            variant="standard"
                            type="number"
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'outputConfiguration/resolution/width',
                            }}
                        />

                        <TextConfigurationField
                            label="Scale Height"
                            variant="standard"
                            type="number"
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'outputConfiguration/resolution/height',
                            }}
                        />
                    </Stack>
                </Box>
            </Grid>
        </Grid>
    );
}
