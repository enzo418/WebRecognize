import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService } from '../services/api/Services';

interface LiveViewBoxProps {
    uri: string;
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
    state: LiveViewBoxState = {
        feedID: '',
        loading: true,
        error: '',
    };

    constructor(props: LiveViewBoxProps) {
        super(props);
    }

    updateLiveFeed() {
        if (!this.props.uri || this.props.uri.length == 0) return;

        liveViewService
            .getCameraView(this.props.uri)
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
        if (this.props.uri !== prevProps.uri) {
            this.updateLiveFeed();
        }
    }

    render() {
        return (
            <>
                {this.state.error.length == 0 &&
                    (this.state.loading ? (
                        <Skeleton
                            variant="rectangular"
                            width={640}
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
