import { Button, Grid } from '@mui/material';
import React, { useState } from 'react';
import { ENotificationType } from '../../domain/Notification';
import { NotificationGroup } from '../../domain/NotificationGroup';
import { intersect } from '../../utils/array';
import { getEnumKeysNames } from '../../utils/enum';
import { ensure } from '../../utils/error';
import Notification from '../../domain/Notification';
import NotificationBodyDisplay from './NotificationBodyDisplay';
import NotificationItemBody from './NotificationItemBody';
import NotificationTypeSelector from './NotificationTypeSelector';
import NotificationDebugVideo from './NotificationDebugVideo';

interface INotificationItemProps {
    notifications: NotificationGroup[];
    currentNotificationIndex: number;
    leftPanelWidth: number;
    isSmallScreen: boolean;

    onShowTimeline: () => any;
}

export default function NotificationItem(props: INotificationItemProps) {
    const { notifications, currentNotificationIndex } = props;

    // notification is the group notification
    const notification = notifications[currentNotificationIndex];

    const types: string[] = ensure(getEnumKeysNames(ENotificationType, true));
    const selectableTypes: string[] = intersect(
        Object.keys(notification),
        types,
    );

    const defaultType = selectableTypes[0];

    const [type, setType] = useState<string>(defaultType);

    // typed notification is a notification with an image/video or text
    const [typedNotification, setTypedNotification] = useState<Notification>(
        Object(notification)[type],
    );

    const handleChangeType = (t: string) => {
        if (notification.hasOwnProperty(t)) {
            setType(t);
            setTypedNotification(ensure(Object(notification)[t]));
        }
    };

    // condition 1: if the notification group changed, check if the old type is
    // available on the new one
    // condition 2: if it changed the notification group then change the typed notf.
    if (
        !notification.hasOwnProperty(type) ||
        typedNotification.group != notification.groupID
    ) {
        let t = type;

        if (!notification.hasOwnProperty(type)) {
            setType(defaultType);
            t = defaultType;
        }

        setTypedNotification(ensure(Object(notification)[t]));
    }

    let text: string | null = null;

    if (notification.text) {
        text = notification.text.text;
    }

    return (
        <>
            <Grid item xs={props.isSmallScreen ? 12 : 8}>
                <NotificationBodyDisplay notification={typedNotification} />

                <NotificationItemBody
                    notification={typedNotification}
                    text={text}
                    sx={{ paddingTop: '15px' }}
                />
            </Grid>
            <Grid item xs={props.isSmallScreen ? 12 : 2}>
                <NotificationTypeSelector
                    type={type}
                    onChange={handleChangeType}
                    allTypes={types}
                    selectableTypes={selectableTypes}
                    isSmallScreen={props.isSmallScreen}
                />
                <NotificationDebugVideo
                    sx={{ mt: '20px', width: '90%' }}
                    notification={typedNotification}
                />
                {props.isSmallScreen && (
                    <Button
                        sx={{ display: 'block', mt: '20px', width: '90%' }}
                        onClick={props.onShowTimeline}
                        variant="outlined"
                        color="inherit">
                        Show timeline
                    </Button>
                )}
            </Grid>
        </>
    );
}
