import {
    Box,
    Divider,
    FormControlLabel,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import React from 'react';
import { useConfiguration } from '../../context/configurationContext';
import {
    SliderConfigurationField,
    SwitchConfigurationField,
    TextConfigurationField,
} from './configurationField';

export default function VideoOutputGeneral() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();
    const commonData = { getFieldCB, updateCB, getInitialValue };

    return (
        <Grid container spacing={{ xs: 2, md: 4 }}>
            <Grid item md={12}>
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

            <Grid item md={12}>
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

            <Grid item md={12}>
                <Typography gutterBottom>
                    Set the maximum frames to emit per second
                </Typography>
                <Typography variant="body2" color={'GrayText'} gutterBottom>
                    This can help to redue the CPU usage, by setting this value
                    to 2-10. Default means that the system chooses a acceptable
                    value.
                </Typography>
                <SliderConfigurationField
                    sx={{ margin: '0 5%', width: '90%' }}
                    data={{
                        ...commonData,
                        path: 'outputConfiguration/maxOutputFps',
                    }}
                    marks={[
                        {
                            value: 0,
                            label: 'default',
                        },
                        {
                            value: 60,
                            label: '60',
                        },
                    ]}
                    max={60}
                    min={0}
                    step={1}
                    valueLabelFormat={(v: number) => v}
                    valueLabelDisplay="auto"
                />
            </Grid>
        </Grid>
    );
}
