import React, { useEffect, useState } from 'react';
import { liveViewService } from '../../services/api/Services';
import ILiveView, { ILiveViewProps } from './ILiveView';
import { Skeleton } from '@mui/material';
import {
    ILiveViewResponse,
    LiveViewStreamSource,
} from '../../services/api/interfaces/ILiveViewService';
import WebRTCLiveView from './WebRTCLiveView';
import MJPEGStreamLiveView from './MJPEGStreamLiveView';
import { GetBrowserCapabilities } from '../../services/BrowserCapabilities/BrowserCapabilities';
import TypedPromise from '../../TypedPromise';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import JPEGCacheBustingStreamLiveView from './JPEGCacheBustingStreamLiveView';

export default React.forwardRef(
    (props: ILiveViewProps, ref: React.Ref<ILiveView>) => {
        const [liveViewComponent, setLiveViewComponent] = useState<any>(null);
        const [isLoading, setLoading] = useState(true);
        let lastPendingPromise = React.useRef<TypedPromise<
            any,
            IProblemJson
        > | null>(null);

        const capabilities = GetBrowserCapabilities();

        const processResponse = (response: ILiveViewResponse) => {
            switch (response.type) {
                case LiveViewStreamSource.WEBRTC:
                    setLiveViewComponent(
                        <WebRTCLiveView
                            {...props}
                            response={response as any}
                            ref={ref as any}
                        />,
                    );
                    break;
                case LiveViewStreamSource.MJPEGSTREAM:
                    setLiveViewComponent(
                        <MJPEGStreamLiveView
                            {...props}
                            response={response as any}
                            ref={ref as any}
                        />,
                    );
                    break;

                case LiveViewStreamSource.JPEGCacheBusting:
                    setLiveViewComponent(
                        <JPEGCacheBustingStreamLiveView
                            {...props}
                            response={response as any}
                            ref={ref as any}
                        />,
                    );
                    break;
                default:
                    console.error('Unknown live view type');
                    break;
            }
            setLoading(false);
        };

        if (
            props.source === undefined ||
            (props.source.cameraID === undefined &&
                props.source.observer === undefined &&
                props.source.uri === undefined)
        ) {
            throw new Error(
                'LiveView component must have at least one of the following props: cameraID, uri, observer',
            );
        }

        useEffect(() => {
            if (props.source.cameraID !== undefined) {
                // TODO: Fix typescript type gymnastics
                lastPendingPromise.current = liveViewService
                    .getCameraView(props.source.cameraID, capabilities)
                    .ok(processResponse)
                    .fail(err => props.onError(err)) as any;
            } else if (props.source.uri !== undefined) {
                lastPendingPromise.current = liveViewService
                    .getSourceView(props.source.uri, capabilities)
                    .ok(processResponse)
                    .fail(err => props.onError(err)) as any;
            } else if (props.source.observer !== undefined) {
                lastPendingPromise.current = liveViewService
                    .getObserverView(capabilities)
                    .ok(processResponse)
                    .fail(err => props.onError(err)) as any;
            }

            return () => {
                if (lastPendingPromise.current)
                    lastPendingPromise.current.cancel();
            };
        }, []);

        return isLoading ? (
            <Skeleton variant="rectangular" width={640} height={360} />
        ) : (
            liveViewComponent ?? null
        );
    },
);
