import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';
import { liveViewService } from '../services/api/Services';

interface LiveViewBoxProps {
    source: {
        cameraID?: string;
        uri?: string;
        observer?: boolean;
    };
    componentOnError?: (error: string) => any;
    keepSkeletonOnError?: boolean;
    style?: object;
}

interface LiveViewBoxState {
    loading: boolean;
    firstImageLoaded: boolean;
    error: string;
}

export default class LiveViewBox extends React.Component<
    LiveViewBoxProps,
    LiveViewBoxState
> {
    lastPendingPromise: any;

    state: LiveViewBoxState = {
        loading: true,
        error: '',
        firstImageLoaded: false,
    };

    constructor(props: LiveViewBoxProps) {
        super(props);

        this.onImageLoaded = this.onImageLoaded.bind(this);
        this.onError = this.onError.bind(this);
    }

    componentWillUnmount(): void {
        if (this.lastPendingPromise) {
            this.lastPendingPromise.cancel();
        }
    }

    onImageLoaded(): void {
        if (!this.state.firstImageLoaded) {
            this.setState({ firstImageLoaded: true, loading: false });
        }
    }

    onError(e: any) {
        console.error(e);
        this.setState({ error: 'Error loading live view' });
    }

    render() {
        return (
            <>
                {this.state.error.length == 0 &&
                    (this.state.loading || !this.state.firstImageLoaded) && (
                        <Skeleton
                            variant="rectangular"
                            width={`min(${640}px, 100%)`}
                            height={360}
                        />
                    )}

                {this.state.error.length == 0 && (
                    <LiveView
                        source={this.props.source}
                        onLoad={this.onImageLoaded}
                        onError={this.onError}
                        style={this.props.style}></LiveView>
                )}

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
