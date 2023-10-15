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

import GridLayout, { Responsive, WidthProvider } from 'react-grid-layout';
import LiveViewObserver from '../components/LivewView/LiveViewObserver';
import eventBus from '../EventBus';
import CamerasStatus from '../components/CamerasStatus';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

    const layout = {
        xss: [
            { i: 'a', x: 0, y: 0, w: 5.5, h: 1 },
            { i: 'b', x: 0, y: 1, w: 5.5, h: 2 },
            { i: 'c', x: 0, y: 2, w: 5.5, h: 1 },
        ],
        sm: [
            { i: 'a', x: 0, y: 0, w: 4, h: 1 },
            { i: 'b', x: 4, y: 0, w: 7, h: 2 },
            { i: 'c', x: 0, y: 1, w: 8, h: 1 },
        ],
        lg: [
            { i: 'a', x: 0, y: 0, w: 3, h: 1 },
            { i: 'b', x: 3, y: 0, w: 8.5, h: 3 },
            { i: 'c', x: 0, y: 1, w: 4, h: 1 },
        ],
    };

    return (
        <ResponsiveGridLayout
            className="layout"
            layouts={layout}
            margin={[15, 15]}
            draggableHandle=".grid-item-header"
            breakpoints={{ xl: 1536, lg: 1200, md: 900, sm: 600, xss: 0 }}
            cols={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, xss: 6 }}>
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
        </ResponsiveGridLayout>
    );
}
