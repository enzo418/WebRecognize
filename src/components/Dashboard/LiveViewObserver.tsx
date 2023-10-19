import {
    Box,
    Button,
    Fade,
    Skeleton,
    Stack,
    SxProps,
    Theme,
    Typography,
} from '@mui/material';
import React from 'react';
import config from '../../config';
import LiveView from '../../modules/LiveView/MJPEGStreamLiveView';
import { liveViewService, observerService } from '../../services/api/Services';
import TypedPromise from '../../TypedPromise';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { Link } from 'react-router-dom';
import LiveViewInteractiveBox from '../LivewView/LiveViewInteractiveBox';
import eventBus from '../../EventBus';
import DTOObserverStatus from '../../services/api/interfaces/DTOObserverStatus';
import { ObserverStatusContext } from '../../context/observerStatusContext';

interface LiveViewObserverProps {
    sx?: SxProps<Theme>;

    playerHeight?: string;
}

interface LiveViewObserverState {
    error: string;
}

export default class LiveViewObserver extends React.Component<
    LiveViewObserverProps,
    LiveViewObserverState
> {
    static contextType? = ObserverStatusContext;

    state: LiveViewObserverState = {
        error: '',
    };

    constructor(props: LiveViewObserverProps) {
        super(props);
    }

    render() {
        return (
            <Box
                sx={{
                    padding: '0',
                    margin: 0,
                    height: '100%',
                    ...this.props.sx,
                }}>
                {this.context?.running && (
                    <LiveViewInteractiveBox
                        source={{
                            observer: true,
                        }}
                        onLoad={() => {}}
                        onError={e => {
                            this.setState({
                                error: `Error loading live view: "${e}"`,
                            });
                        }}
                        playerHeight={
                            this.props.playerHeight
                        }></LiveViewInteractiveBox>
                )}

                {!this.context?.running && (
                    <Fade in={true} timeout={1000}>
                        <Stack
                            direction={'column'}
                            alignItems={'center'}
                            justifyContent={'center'}
                            height={'100%'}
                            spacing={2}>
                            <SettingsInputAntennaIcon sx={{ fontSize: 50 }} />

                            <Typography variant="h4" gutterBottom>
                                Observer is not running
                            </Typography>

                            <Typography variant="body1" gutterBottom>
                                The observer is not running. You can start it
                                from <Link to="/dashboard"> here</Link>
                            </Typography>
                        </Stack>
                    </Fade>
                )}
            </Box>
        );
    }
}
