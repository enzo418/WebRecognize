import {
    Box,
    Divider,
    FormControlLabel,
    Grid,
    Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback } from 'react';
import { UpdateFieldCallback } from '../context/configurationContext';
import IProblemJson from '../services/api/interfaces/IProblemJson';
import { serverConfigurationService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';
import { SwitchConfigurationField } from './Configuration/configurationField';

export default function ApplicationConfiguration() {
    const updateCB: UpdateFieldCallback = (path: string, value: any) => {
        return serverConfigurationService.setField({
            field: path,
            value,
        });
    };

    const getFieldCB = (path: string) => {
        return new TypedPromise<any, IProblemJson>((ok, fail) => {
            serverConfigurationService
                .getField(path)
                .ok(v => {
                    ok(v);
                })
                .fail(e => fail(e));
        });
    };

    const commonData = {
        updateCB,
        getFieldCB,
        getInitialValue: () => undefined,
    };

    return (
        <Stack direction={'column'} sx={{ padding: '20px 6px' }} spacing={2}>
            <Box>
                <Typography textAlign={'center'} variant="h6" gutterBottom>
                    Web application configuration
                </Typography>
                <Divider sx={{ mb: '20px' }} />

                <Grid container></Grid>
            </Box>

            <Box>
                <Typography textAlign={'center'} variant="h6" gutterBottom>
                    Server configuration
                </Typography>
                <Divider sx={{ mb: '20px' }} />

                <Grid container>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <SwitchConfigurationField
                                    data={{
                                        ...commonData,
                                        path: 'SaveNotificationDebugVideo',
                                        defaultValue: true,
                                    }}
                                />
                            }
                            label="Save notification debug video"
                        />
                        <Typography
                            variant="body2"
                            color={'GrayText'}
                            gutterBottom
                            sx={{ ml: '5px' }}>
                            If enabled, a separate video will be saved with the
                            camera's original resolution that you can use to
                            modify and test the detection parameters for
                            improvement.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
}
