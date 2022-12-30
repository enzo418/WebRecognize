import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';

interface LiveViewPageProps {}

interface LiveViewPageState {
    loading: boolean;
    error: string;
    feedsID: string[];
}

export default class LiveViewPage extends React.Component<
    LiveViewPageProps,
    LiveViewPageState
> {
    state: LiveViewPageState = {
        feedsID: [],
        loading: true,
        error: '',
    };

    constructor(props: LiveViewPageProps) {
        super(props);
    }

    componentDidMount() {
        liveViewService
            .getAllCamerasView()
            .ok(data => {
                this.setState(prev => {
                    if (prev.feedsID.indexOf(data.ws_feed_id) < 0) {
                        prev.feedsID.push(data.ws_feed_id);
                    }

                    return {
                        loading: false,
                        error: '',
                        feedsID: prev.feedsID,
                    };
                });
            })
            .fail(err => {
                console.log('Live view page error: ', err);
                this.setState({
                    error: err.title || 'unknown error',
                    loading: false,
                });
            });
    }

    render() {
        return (
            <Box sx={{ padding: '10px' }}>
                {this.state.error.length == 0 && this.state.loading ? (
                    <Skeleton variant="rectangular" width={640} height={360} />
                ) : (
                    this.state.feedsID.map(feedID => (
                        <LiveView
                            key={feedID}
                            feedID={feedID}
                            onLoad={() => {}}
                            style={{}}></LiveView>
                    ))
                )}
                {this.state.error.length != 0 && (
                    <Typography>ERROR {this.state.error}</Typography>
                )}
            </Box>
        );
    }
}
