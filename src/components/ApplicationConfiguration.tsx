import { DarkMode, LightMode } from '@mui/icons-material';
import {
    Box,
    Divider,
    FormControlLabel,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useState } from 'react';
import { UpdateFieldCallback } from '../context/configurationContext';
import eventBus from '../EventBus';
import { getLocalDefault, Key, saveLocal } from '../LocalStore';
import IProblemJson from '../services/api/interfaces/IProblemJson';
import { serverConfigurationService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';
import {
    SwitchConfigurationField,
    TextConfigurationField,
} from './Configuration/configurationField';

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

    const [themeMode, setThemeMode] = useState<string>(
        getLocalDefault(Key.THEME_MODE, 'dark'),
    );

    const onThemeModeChange = (_: any, mode: string) => {
        setThemeMode(mode);
        eventBus.dispatch('theme-mode-changed', mode as any);
        saveLocal(Key.THEME_MODE, mode);
    };

    return (
        <Stack direction={'column'} sx={{ padding: '20px 6px' }} spacing={2}>
            <Box>
                <Typography textAlign={'center'} variant="h6" gutterBottom>
                    Web application configuration
                </Typography>
                <Divider sx={{ mb: '20px' }} />

                <Grid container>
                    <Grid item xs={6} md={4}>
                        <Typography variant="overline" color="GrayText">
                            Theme
                        </Typography>

                        <br></br>

                        <ToggleButtonGroup
                            value={themeMode}
                            exclusive
                            onChange={onThemeModeChange}>
                            <ToggleButton
                                value={'light'}
                                aria-label="light mode">
                                <LightMode />
                            </ToggleButton>
                            <ToggleButton value={'dark'} aria-label="dark mode">
                                <DarkMode />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <Typography textAlign={'center'} variant="h6" gutterBottom>
                    Server configuration
                </Typography>
                <Divider sx={{ mb: '20px' }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                            gutterBottom>
                            If enabled, a separate video will be saved with the
                            camera's original resolution that you can use to
                            modify and test the detection parameters for
                            improvement.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Media folder path</Typography>
                        <TextConfigurationField
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'mediaFolder',
                                beforeSendValue(value: string) {
                                    return !value.endsWith('/')
                                        ? value + '/'
                                        : value;
                                },
                            }}
                            sx={{ mb: '5px' }}
                        />
                        <Typography variant="body2" color={'GrayText'}>
                            Folder where the images/videos will be stored. It
                            can be relative (e.g. "media/all") or absolute (e.g.
                            "/mnt/ssd/server_media")
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                            Delete notifications older than
                        </Typography>
                        <TextConfigurationField
                            fullWidth
                            type="number"
                            data={{
                                ...commonData,
                                path: 'notificationCleanupFilter/deleteIfOlderThanDays',
                                defaultValue: 1,
                            }}
                            helperText="in days"
                            sx={{ mb: '5px' }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                            Maximum size in megabytes in total of DEBUG VIDEOS
                        </Typography>
                        <TextConfigurationField
                            fullWidth
                            data={{
                                ...commonData,
                                path: 'notificationDebugVideoFilter/keepTotalNotReclaimedBelowMB',
                                defaultValue: 0,
                            }}
                            type="number"
                            sx={{ mb: '5px' }}
                        />
                        <Typography variant="body2" color={'GrayText'}>
                            Only unclaimed videos will be deleted, i.e. those in
                            which you have not clicked on "debug notification".
                            Assuming that each one can be between 30 and 100 MB
                            depending on the length you can calculate how many
                            you want to leave.
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
}
