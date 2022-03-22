import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import {useState} from 'react';

interface SkeletonVideoProps {
    src: string;
};

export default function SkeletonVideo(props:SkeletonVideoProps) {
    const [loaded, setLoaded] = useState<boolean>(false);

    return (<>
        {!loaded ?
            (<Skeleton variant="rectangular" width="auto" height={360} />) : <></>}
        <video
            controls
            style={{
                'display': loaded ? 'block' : 'none',
            }}
            src={props.src}
            onLoadedMetadata={() => {
                setLoaded(true);
            }}></video>
    </>
    );
}
