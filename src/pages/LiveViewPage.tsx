import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService, observerService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';

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
            .catch(e => {
                this.setState({
                    error: 'Error loading observer status',
                    loading: false,
                });
            });
    }

    render() {
        return (
            <Box sx={{ padding: '10px' }}>
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
                        style={{}}></LiveView>
                )}

                {this.state.error.length != 0 && (
                    <Typography>ERROR {this.state.error}</Typography>
                )}

                {!this.state.observerRunning && (
                    <Typography>
                        Observer is not running. Please start it.
                    </Typography>
                )}
            </Box>
        );
    }
}
