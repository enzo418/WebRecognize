import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import config from '../config';
import processPromise from '../Http/ProcessPromise';
import LiveView from '../modules/LiveView';
import IProblemJson from '../services/api/interfaces/IProblemJson';
import { client } from '../services/api/Services';

interface CameraFrameBoxProps {
    uri?: string;
    camera_id?: string;
    componentOnError?: (error: string) => any;
    keepSkeletonOnError?: boolean;
    style?: object;
}

interface CameraFrameBoxState {
    loading: boolean;
    error: string;
}

export default class CameraFrameBox extends React.Component<
    CameraFrameBoxProps,
    CameraFrameBoxState
> {
    state: CameraFrameBoxState = {
        loading: true,
        error: '',
    };
    image: React.RefObject<any>;

    constructor(props: CameraFrameBoxProps) {
        super(props);

        this.image = React.createRef();

        if (!props.camera_id && !props.uri)
            throw 'At least one was expected: camera_id or uri';
    }

    updateLiveFeed() {
        const query = this.props.uri
            ? { uri: this.props.uri }
            : { camera_id: this.props.camera_id };

        client
            .get(config.endpoints.api.cameraFrame, query, {
                cache: 'force-cache',
            })
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const blob = new Blob([buffer], { type: 'image/jpeg' });

                if (this.image.current) {
                    this.image.current.src = URL.createObjectURL(blob);
                }

                this.setState({ loading: false, error: '' });
            })
            .catch(e => {
                this.setState({
                    loading: false,
                    error: e.title || 'unknown error',
                });
                console.error('Could not get the camera frame: ', e);
            });
    }

    componentDidMount() {
        this.updateLiveFeed();
    }

    componentWillUnmount() {
        // URL.revokeObjectURL(this.image.current.src);
    }

    componentDidUpdate(prevProps: CameraFrameBoxProps) {
        // Typical usage (don't forget to compare props):
        if (
            this.props.uri !== prevProps.uri ||
            this.props.camera_id !== prevProps.camera_id
        ) {
            this.updateLiveFeed();
        }
    }

    onImageLoaded = () => {
        URL.revokeObjectURL(this.image.current.src);
    };

    render() {
        const imageStyle = Object.assign(
            {
                display:
                    this.state.error.length !== 0 || this.state.loading
                        ? 'none'
                        : 'block',
            },
            this.props.style,
        );

        return (
            <>
                <img
                    ref={this.image}
                    onLoad={this.onImageLoaded}
                    style={imageStyle}></img>
                {this.state.error.length == 0 && this.state.loading && (
                    <Skeleton variant="rectangular" width={640} height={360} />
                )}
            </>
        );
    }
}
