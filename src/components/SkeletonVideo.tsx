import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useState } from 'react';

interface SkeletonVideoProps {
    src: string;
    hide: boolean;
}

export const SkeletonVideo = React.forwardRef<any, SkeletonVideoProps>(
    (props, ref) => {
        const [loaded, setLoaded] = useState<boolean>(false);

        return (
            <>
                {!props.hide && !loaded ? (
                    <Skeleton variant="rectangular" width="auto" height={360} />
                ) : (
                    <></>
                )}
                <video
                    controls
                    crossOrigin="anonymous"
                    style={{
                        display: loaded && !props.hide ? 'block' : 'none',
                        width: '100%',
                    }}
                    ref={ref}
                    src={props.src}
                    onLoadedMetadata={() => {
                        setLoaded(true);
                    }}></video>
            </>
        );
    },
);
