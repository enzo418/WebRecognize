import { Grid } from '@mui/material';
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

interface INotificationItemProps {
    notifications: NotificationGroup[];
    currentNotificationIndex: number;
}

export default function NotificationItem(props: INotificationItemProps) {
    const { notifications, currentNotificationIndex } = props;

    console.log('item: ', { notifications, currentNotificationIndex });

    // notification is the group notification
    const notification = notifications[currentNotificationIndex];

    const types: string[] = ensure(getEnumKeysNames(ENotificationType, true));
    const selectableTypes: string[] = intersect(
        Object.keys(notification),
        types,
    );

    const defaulttype = selectableTypes[0];

    const [type, setType] = useState<string>(defaulttype);

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
            setType(defaulttype);
            t = defaulttype;
        }

        setTypedNotification(ensure(Object(notification)[t]));
    }

    let text: string | null = null;

    if (notification.text) {
        text = notification.text.text;
    }

    return (
        <>
            <Grid item xs={8}>
                <NotificationBodyDisplay notification={typedNotification} />

                <NotificationItemBody
                    notification={typedNotification}
                    text={text}
                    sx={{ paddingTop: '15px' }}
                />
            </Grid>
            <Grid item xs={2}>
                <NotificationTypeSelector
                    type={type}
                    onChange={handleChangeType}
                    allTypes={types}
                    selectableTypes={selectableTypes}
                />
            </Grid>
        </>
    );
}
