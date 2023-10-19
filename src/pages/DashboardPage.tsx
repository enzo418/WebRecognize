import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Stack, Theme, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import ToggleRecognizeButton from '../components/Dashboard/ToggleRecognizeButton';
import { Key, saveLocal } from '../LocalStore';
import { observerService } from '../services/api/Services';

import '../styles/GridLayout.scss';

import { Responsive, WidthProvider } from 'react-grid-layout';
import LiveViewObserver from '../components/Dashboard/LiveViewObserver';
import CamerasStatus from '../components/Dashboard/CamerasStatus';
import { DashboardItemContext } from '../components/Dashboard/DashboardItemContext';

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
        const width = ref.current?.clientWidth;

        return (
            <DashboardItemContext.Provider value={{ width: width }}>
                <Box
                    style={{ ...style }}
                    className={'grid-item'}
                    ref={ref}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onTouchEnd={onTouchEnd}
                    sx={{
                        backgroundColor: (theme: Theme) =>
                            theme.palette.mode === 'dark'
                                ? '#171819'
                                : '#f5f5f5',
                        padding: '0 5px 5px 5px',
                        '> .react-resizable-handle': {
                            filter: (theme: Theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'invert(1)'
                                    : 'invert(0)',
                        },
                        boxShadow: '5px 5px 15px rgb(0 0 0 / 57%)',
                        borderRadius: '10px',
                    }}
                    {...props}>
                    <Stack
                        className="grid-item-header"
                        direction="row"
                        sx={{
                            width: '100%',
                            color: (theme: Theme) =>
                                theme.palette.text.secondary,
                            cursor: 'move',
                        }}
                        justifyContent={'space-between'}>
                        <Typography
                            variant={'overline'}
                            fontSize={'0.7rem'}
                            pl={'5px'}>
                            {title}
                        </Typography>

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
            </DashboardItemContext.Provider>
        );
    },
);

export default function DashboardPage() {
    let lastPendingPromise: any = useRef(null);

    const onClickStart = (config_id: string) => {
        lastPendingPromise = observerService
            .start(config_id)
            .ok(() => {
                saveLocal(Key.LAST_CONFIGURATION_EXECUTED_ID, config_id);
            })
            .fail(e => {
                console.error('could not start observer: ', e);
            })
            .cancelled(() => console.debug('canceled start'));
    };

    const onClickStop = () => {
        lastPendingPromise = observerService
            .stop()
            .fail(e => {
                console.error('could not stop observer: ', e);
            })
            .cancelled(() => console.debug('canceled stop'));
    };

    useEffect(() => {
        return () => {
            if (lastPendingPromise) lastPendingPromise.cancel();
        };
    }, []);

    const layout = {
        xss: [
            { i: 'a', x: 0, y: 0, w: 5.5, h: 1 },
            { i: 'b', x: 0, y: 1, w: 5.5, h: 2 },
            { i: 'c', x: 0, y: 2, w: 5.5, h: 1 },
        ],
        sm: [
            { i: 'a', x: 0, y: 0, w: 5, h: 1 },
            { i: 'b', x: 5, y: 0, w: 7, h: 2 },
            { i: 'c', x: 0, y: 1, w: 5, h: 1 },
        ],
        lg: [
            { i: 'a', x: 0, y: 0, w: 3, h: 1 },
            { i: 'b', x: 3, y: 0, w: 9, h: 3 },
            { i: 'c', x: 0, y: 1, w: 3, h: 2 },
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
                    sx={{ margin: 'auto' }}
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
