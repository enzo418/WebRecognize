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
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService, observerService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { Link } from 'react-router-dom';
import LiveViewInteractiveBox from './LiveViewInteractiveBox';
import eventBus from '../EventBus';

interface LiveViewObserverProps {
    sx?: SxProps<Theme>;

    playerHeight?: string;
}

interface LiveViewObserverState {
    loading: boolean;
    error: string;
    observerRunning: boolean;
}

export default class LiveViewObserver extends React.Component<
    LiveViewObserverProps,
    LiveViewObserverState
> {
    state: LiveViewObserverState = {
        loading: true,
        error: '',
        observerRunning: false,
    };

    constructor(props: LiveViewObserverProps) {
        super(props);

        this.observerChangedStatus = this.observerChangedStatus.bind(this);
    }

    observerChangedStatus({ running }: any) {
        this.setState({ observerRunning: running, loading: false });
    }

    componentDidMount(): void {
        eventBus.on('observer-status-changed', this.observerChangedStatus);

        observerService
            .status()
            .ok(status => {
                if (status.running) {
                    this.setState({ observerRunning: true });
                }

                this.setState({ loading: false });
            })
            .catch(() => {
                this.setState({
                    error: 'Error loading observer status',
                    loading: false,
                });
            });
    }

    componentWillUnmount(): void {
        eventBus.remove('observer-status-changed', this.observerChangedStatus);
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
                {this.state.error.length == 0 && this.state.loading && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}

                {this.state.observerRunning && (
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

                {this.state.error.length != 0 && (
                    <Typography>ERROR {this.state.error}</Typography>
                )}

                {!this.state.observerRunning && (
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
