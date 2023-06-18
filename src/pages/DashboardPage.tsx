import { SettingsApplicationsOutlined } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Stack,
    Theme,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ToggleRecognizeButton from '../components/ToggleRecognizeButton';
import { Key, saveLocal } from '../LocalStore';
import DTOObserverStatus from '../services/api/interfaces/DTOObserverStatus';
import { observerService } from '../services/api/Services';

import '../styles/GridLayout.scss';

import GridLayout from 'react-grid-layout';
import LiveViewObserver from '../components/LiveViewObserver';
import eventBus from '../EventBus';
import CamerasStatus from '../components/CamerasStatus';

const CustomGridItemComponent = React.forwardRef(
    (
        {
            title,
            style,
            onMouseDown,
            onMouseUp,
            onTouchEnd,
            children,
            ...props
        }: any,
        ref: any,
    ) => {
        return (
            <Box
                style={{ ...style }}
                className={'grid-item'}
                ref={ref}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                sx={{
                    backgroundColor: (theme: Theme) =>
                        theme.palette.mode === 'dark' ? '#171819' : '#f5f5f5',
                    padding: '5px',
                    '> .react-resizable-handle': {
                        filter: (theme: Theme) =>
                            theme.palette.mode === 'dark'
                                ? 'invert(1)'
                                : 'invert(0)',
                    },
                }}
                {...props}>
                <Stack
                    className="grid-item-header"
                    direction="row"
                    sx={{
                        width: '100%',
                        color: (theme: Theme) => theme.palette.text.secondary,
                        cursor: 'move',
                    }}
                    justifyContent={'space-between'}>
                    <Typography variant={'body1'}>{title}</Typography>

                    <IconButton
                        aria-label="Settings"
                        className="grid-item-header-settings"
                        sx={{
                            borderRadius: '2px',
                            padding: 0,
                            margin: 0,
                            color: (theme: Theme) =>
                                theme.palette.text.secondary,
                        }}>
                        <MoreVertIcon />
                    </IconButton>
                </Stack>
                {children}
            </Box>
        );
    },
);

export default function DashboardPage() {
    const [observerStatus, setObserverStatus] = useState<DTOObserverStatus>({
        running: false,
        config_id: '',
        cameras: [],
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
                eventBus.dispatch('observer-status-changed', status);

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
            .ok(status => {
                eventBus.dispatch('observer-status-changed', status);
                setObserverStatus(status);
            })
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

    const layout = [
        { i: 'a', x: 0, y: 0, w: 3, h: 2, static: true },
        { i: 'b', x: 0, y: 1, w: 6, h: 9, minH: 8 },
        { i: 'c', x: 6, y: 0, w: 4, h: 12, minH: 2 },
    ];

    return (
        <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            width={screen.width * 0.97}
            margin={[15, 15]}
            draggableHandle=".grid-item-header">
            <CustomGridItemComponent key="a" title="Observer control">
                <ToggleRecognizeButton
                    sx={{ padding: '20px' }}
                    status={observerStatus}
                    onClickStart={onClickStart}
                    onClickStop={onClickStop}
                />
            </CustomGridItemComponent>

            <CustomGridItemComponent key="b" title="Live">
                <LiveViewObserver playerHeight={'90%'} />
            </CustomGridItemComponent>

            <CustomGridItemComponent key="c" title="Camera controls">
                <CamerasStatus />
            </CustomGridItemComponent>

            {/* TODO: Movement charts */}
        </GridLayout>
    );
}
