import { Skeleton } from '@mui/material';
import React from 'react';
import { cameraService } from '../services/api/Services';

interface CameraFrameBoxProps {
    camera_id: string;
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
    }

    updateLiveFeed() {
        cameraService
            .getFrame(this.props.camera_id)
            .ok(blob => {
                if (this.image.current) {
                    this.image.current.src = URL.createObjectURL(blob);
                }

                this.setState({ loading: false, error: '' });
            })
            .fail(e => {
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
        if (this.props.camera_id !== prevProps.camera_id) {
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
