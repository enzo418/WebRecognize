import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ToggleRecognizeButton from '../components/ToggleRecognizeButton';
import DTOObserverStatus from '../services/api/interfaces/DTOObserverStatus';
import { observerService } from '../services/api/Services';

export default function DashboardPage() {
    const [observerStatus, setObserverStatus] = useState<DTOObserverStatus>({
        running: false,
        config_id: ''
    });

    const updateObserverStatus = () => {
        observerService
            .status()
            .ok(status => {
                setObserverStatus(status);
            })
            .fail(e => console.error('Could not get observer status', e));
    };

    useEffect(updateObserverStatus, []);

    const onClickStart = (config_id: string) => {
        observerService
            .start(config_id)
            .ok(status => setObserverStatus(status))
            .fail(e => {
                console.error('could not start observer: ', e);
                updateObserverStatus();
            });
    };

    const onClickStop = () => {
        observerService
            .stop()
            .ok(status => setObserverStatus(status))
            .fail(e => {
                console.error('could not stop observer: ', e);
                updateObserverStatus();
            });
    };

    return (
        <Grid sx={{ padding: '20px 6px' }}>
            <Grid item xs={12} sm={12} md={6}>
                <ToggleRecognizeButton
                    status={observerStatus}
                    onClickStart={onClickStart}
                    onClickStop={onClickStop}
                />
            </Grid>
        </Grid>
    );
}
