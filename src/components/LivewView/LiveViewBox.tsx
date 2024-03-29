import { Box, Skeleton, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';
import config from '../../config';
import MJPEGStreamLiveView from '../../modules/LiveView/MJPEGStreamLiveView';
import { liveViewService } from '../../services/api/Services';
import WebRTCLiveView from '../../modules/LiveView/WebRTCLiveView';
import ILiveView, { ILiveViewProps } from '../../modules/LiveView/ILiveView';
import LiveViewSelector from '../../modules/LiveView/LiveViewSelector';

export interface LiveViewBoxProps extends ILiveViewProps {
    componentOnError?: (error: string) => any;
    keepSkeletonOnError?: boolean;
    forwardedRef?: any;
    imageStyle?: object;
}

interface LiveViewBoxState {
    loading: boolean;
    firstImageLoaded: boolean;
    error: string;
}

class LiveViewBox extends React.Component<LiveViewBoxProps, LiveViewBoxState> {
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
            <Box sx={this.props.style}>
                {this.state.error.length == 0 &&
                    (this.state.loading || !this.state.firstImageLoaded) && (
                        <Skeleton
                            variant="rectangular"
                            width={`min(${640}px, 100%)`}
                            height={360}
                        />
                    )}

                {this.state.error.length == 0 && (
                    <LiveViewSelector
                        ref={this.props.forwardedRef}
                        source={this.props.source}
                        onLoad={this.onImageLoaded}
                        onError={this.onError}
                        style={this.props.imageStyle}
                    />
                )}

                {this.state.error.length != 0 &&
                    !this.props.keepSkeletonOnError &&
                    this.props.componentOnError &&
                    this.props.componentOnError(this.state.error)}
                {this.state.error.length != 0 && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}
            </Box>
        );
    }
}

export default React.forwardRef<ILiveView, LiveViewBoxProps>((props, ref) => (
    <LiveViewBox {...props} forwardedRef={ref} />
));
