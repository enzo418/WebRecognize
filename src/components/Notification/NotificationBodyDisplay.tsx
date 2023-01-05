import { Box, Grow, Stack, Zoom } from '@mui/material';
import React from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

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

    return (
        <Box sx={{ minHeight: '150px' }}>
            <NotificationBodyDisplayImage
                hide={notification.type !== ENotificationType.IMAGE}
                mediaURI={(notification as MediaNotification).mediaURI}
            />

            <NotificationBodyDisplayVideo
                hide={notification.type !== ENotificationType.VIDEO}
                mediaURI={(notification as MediaNotification).mediaURI}
            />

            <NotificationBodyDisplayText
                hide={notification.type !== ENotificationType.TEXT}
                text={(notification as TextNotification).text}
            />
        </Box>
    );
}
