import { SettingsApplicationsOutlined } from '@mui/icons-material';
import { Button, Grid, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ToggleRecognizeButton from '../components/ToggleRecognizeButton';
import { Key, saveLocal } from '../LocalStore';
import DTOObserverStatus from '../services/api/interfaces/DTOObserverStatus';
import { observerService } from '../services/api/Services';

export default function DashboardPage() {
    const [observerStatus, setObserverStatus] = useState<DTOObserverStatus>({
        running: false,
        config_id: '',
    });

    const navigate = useNavigate();

    let lastPendingPromise: any;
    const updateObserverStatus = () => {
        lastPendingPromise = observerService
            .status()
            .ok(status => {
                setObserverStatus(status);
            })
            .fail(e => console.error('Could not get observer status', e))
            .cancelled(() => console.debug('canceled update status'));
    };

    const onClickStart = (config_id: string) => {
        lastPendingPromise = observerService
            .start(config_id)
            .ok(status => {
                saveLocal(Key.LAST_CONFIGURATION_EXECUTED_ID, config_id);
                setObserverStatus(status);
            })
            .fail(e => {
                console.error('could not start observer: ', e);
                updateObserverStatus();
            })
            .cancelled(() => console.debug('canceled start'));
    };

    const onClickStop = () => {
        lastPendingPromise = observerService
            .stop()
            .ok(status => setObserverStatus(status))
            .fail(e => {
                console.error('could not stop observer: ', e);
                updateObserverStatus();
            })
            .cancelled(() => console.debug('canceled stop'));
    };

    useEffect(() => {
        updateObserverStatus();

        return () => {
            if (lastPendingPromise) lastPendingPromise.cancel();
        };
    }, []);

    const onNavigateToApplicationConfiguration = () => {
        navigate('/application/configuration');
    };

    return (
        <Grid sx={{ padding: '20px 6px' }}>
            <Grid item xs={12} sm={12} md={12}>
                <Stack direction={'row'} justifyContent={'space-between'}>
                    <ToggleRecognizeButton
                        status={observerStatus}
                        onClickStart={onClickStart}
                        onClickStop={onClickStop}
                    />

                    <Button
                        variant="contained"
                        color="inherit"
                        startIcon={<SettingsApplicationsOutlined />}
                        onClick={onNavigateToApplicationConfiguration}>
                        Application settings
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
}
