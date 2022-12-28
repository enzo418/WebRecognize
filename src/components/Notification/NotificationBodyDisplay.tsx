import { Stack } from '@mui/material';
import React from 'react';

import Notification, {
    ENotificationType,
    MediaNotification,
    TextNotification,
} from '../../domain/Notification';
import {
    NotificationBodyDisplayImage,
    NotificationBodyDisplayVideo,
    NotificationBodyDisplayText,
} from './NotificationDisplayEach';

interface INotificationBodyDisplayProps {
    notification: Notification;
}

export default function NotificationBodyDisplay(
    props: INotificationBodyDisplayProps,
) {
    const { notification } = props;

    let element = null;

    switch (notification.type) {
        case ENotificationType.IMAGE:
            element = (
                <NotificationBodyDisplayImage
                    mediaURI={(notification as MediaNotification).mediaURI}
                />
            );
            break;
        case ENotificationType.VIDEO:
            element = (
                <NotificationBodyDisplayVideo
                    mediaURI={(notification as MediaNotification).mediaURI}
                />
            );
            break;
        case ENotificationType.TEXT:
            element = (
                <NotificationBodyDisplayText
                    text={(notification as TextNotification).text}
                />
            );
            break;
    }

    console.log(element);

    return (
        <Stack spacing={1}>
            {/* <Skeleton variant="text" />*/}
            {/* <Skeleton variant="rectangular" width={600} height={360} />*/}

            {element}
        </Stack>
    );
}
