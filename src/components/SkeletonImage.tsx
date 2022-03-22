import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import {useState} from 'react';

interface SkeletonImageProps {
    src: string;
};

export default function SkeletonImage(props:SkeletonImageProps) {
    const [loaded, setLoaded] = useState<boolean>(false);

    return (<>
        {!loaded ?
            (<Skeleton variant="rectangular" width="auto" height={360} />) : <></>}
        <img
            style={{
                'display': loaded ? 'block' : 'none',
            }}
            src={props.src}
            onLoad={() => {
                setLoaded(true);
            }}/>
    </>
    );
}
