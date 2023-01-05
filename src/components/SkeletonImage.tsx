import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useState } from 'react';

interface SkeletonImageProps {
    src: string;
    hide: boolean;
}

export const SkeletonImage = React.forwardRef<any, SkeletonImageProps>(
    (props, ref) => {
        const [loaded, setLoaded] = useState<boolean>(false);

        return (
            <>
                {!props.hide && !loaded ? (
                    <Skeleton variant="rectangular" width="auto" height={360} />
                ) : (
                    <></>
                )}
                <img
                    style={{
                        display: loaded && !props.hide ? 'block' : 'none',
                        width: '100%',
                    }}
                    src={props.src}
                    ref={ref}
                    onLoad={() => {
                        setLoaded(true);
                    }}
                />
            </>
        );
    },
);
