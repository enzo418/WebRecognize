import { Box, Typography } from '@mui/material';
import React from 'react';
import { SkeletonImage } from '../SkeletonImage';
import { SkeletonVideo } from '../SkeletonVideo';

interface IBaseDisplay {
    hide: boolean;
}

interface INotificationBodyDisplayMediaProps extends IBaseDisplay {
    mediaURI: string;
}

export const NotificationBodyDisplayImage = React.forwardRef<
    any,
    INotificationBodyDisplayMediaProps
>((props, ref) => (
    <SkeletonImage
        ref={ref}
        hide={props.hide}
        src={props.mediaURI}></SkeletonImage>
));

export const NotificationBodyDisplayVideo = React.forwardRef<
    any,
    INotificationBodyDisplayMediaProps
>((props, ref) => (
    <SkeletonVideo
        ref={ref}
        hide={props.hide}
        src={props.mediaURI}></SkeletonVideo>
));

interface INotificationBodyDisplayTextProps extends IBaseDisplay {
    text: string;
}

export const NotificationBodyDisplayText = React.forwardRef<
    any,
    INotificationBodyDisplayTextProps
>((props, ref) => (
    <Box
        ref={ref}
        sx={{
            display: props.hide ? 'none' : 'block',
            minWidth: '100%',
            minHeight: '30vh',
        }}>
        <Typography>{props.text}</Typography>
    </Box>
));
