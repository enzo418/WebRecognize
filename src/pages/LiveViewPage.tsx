import { Box, Fade, Skeleton, Stack, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService, observerService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { Link } from 'react-router-dom';

interface LiveViewPageProps {}

interface LiveViewPageState {
    loading: boolean;
    error: string;
    firstImageLoaded: boolean;
    observerRunning: boolean;
}

export default class LiveViewPage extends React.Component<
    LiveViewPageProps,
    LiveViewPageState
> {
    state: LiveViewPageState = {
        loading: true,
        firstImageLoaded: false,
        error: '',
        observerRunning: false,
    };

    constructor(props: LiveViewPageProps) {
        super(props);
    }

    componentDidMount(): void {
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

    render() {
        return (
            <Box sx={{ padding: '0', height: '100%' }}>
                {this.state.error.length == 0 && this.state.loading && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}

                {this.state.observerRunning && (
                    <LiveView
                        source={{
                            observer: true,
                        }}
                        onLoad={() => {
                            if (!this.state.firstImageLoaded)
                                this.setState({ firstImageLoaded: true });
                        }}
                        onError={e =>
                            this.setState({
                                error: `Error loading live view: "${e}"`,
                            })
                        }
                        style={{ padding: '10px' }}></LiveView>
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
