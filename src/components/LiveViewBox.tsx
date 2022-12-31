import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService } from '../services/api/Services';

interface LiveViewBoxProps {
    camera_id: string;
    componentOnError?: (error: string) => any;
    keepSkeletonOnError?: boolean;
    style?: object;
}

interface LiveViewBoxState {
    loading: boolean;
    error: string;
    feedID: string;
}

export default class LiveViewBox extends React.Component<
    LiveViewBoxProps,
    LiveViewBoxState
> {
    lastPendingPromise: any;

    state: LiveViewBoxState = {
        feedID: '',
        loading: true,
        error: '',
    };

    constructor(props: LiveViewBoxProps) {
        super(props);
    }

    updateLiveFeed() {
        if (!this.props.camera_id || this.props.camera_id.length == 0) return;

        this.lastPendingPromise = liveViewService
            .getCameraView(this.props.camera_id)
            .ok(data => {
                this.setState({
                    feedID: data.ws_feed_id,
                    error: '',
                    loading: false,
                });
            })
            .fail(err => {
                console.log('Live view camera error: ', err);
                this.setState({
                    error: err.title || 'unknown error',
                    loading: false,
                });
            });
    }

    componentDidMount() {
        this.updateLiveFeed();
    }

    componentDidUpdate(prevProps: LiveViewBoxProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.camera_id !== prevProps.camera_id) {
            this.updateLiveFeed();
        }
    }

    componentWillUnmount(): void {
        if (this.lastPendingPromise) {
            this.lastPendingPromise.cancel();
        }
    }

    render() {
        return (
            <>
                {this.state.error.length == 0 &&
                    (this.state.loading ? (
                        <Skeleton
                            variant="rectangular"
                            width={`min(${640}px, 100%)`}
                            height={360}
                        />
                    ) : (
                        <LiveView
                            feedID={this.state.feedID}
                            onLoad={() => {}}
                            style={this.props.style}></LiveView>
                    ))}
                {this.state.error.length != 0 &&
                    !this.props.keepSkeletonOnError &&
                    this.props.componentOnError &&
                    this.props.componentOnError(this.state.error)}
                {this.state.error.length != 0 && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}
            </>
        );
    }
}
