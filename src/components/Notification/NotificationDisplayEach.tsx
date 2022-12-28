import { Box, Typography } from '@mui/material';
import React from 'react';
import SkeletonImage from '../SkeletonImage';
import SkeletonVideo from '../SkeletonVideo';

interface INotificationBodyDisplayMediaProps {
    mediaURI: string;
}

export function NotificationBodyDisplayImage(
    props: INotificationBodyDisplayMediaProps,
) {
    return <SkeletonImage src={props.mediaURI}></SkeletonImage>;
}

export function NotificationBodyDisplayVideo(
    props: INotificationBodyDisplayMediaProps,
) {
    return <SkeletonVideo src={props.mediaURI}></SkeletonVideo>;
}

interface INotificationBodyDisplayTextProps {
    text: string;
}

export function NotificationBodyDisplayText(
    props: INotificationBodyDisplayTextProps,
) {
    return (
        <Box
            sx={{
                minWidth: '100vw',
                minHeight: '30vh',
            }}>
            <Typography>{props.text}</Typography>
        </Box>
    );
}
