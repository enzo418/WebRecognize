import { Stack, Typography, Box, Skeleton } from '@mui/material';
import React from 'react';

import Notification from '../../domain/Notification';

interface INotificationItemBodyProps {
    notification: Notification;
    text: string | null;
    sx?: any;
}

export default function NotificationItemBody(
    props: INotificationItemBodyProps,
) {
    const { notification, text } = props;

    return (
        <Stack spacing={1} sx={props.sx}>
            <Typography className="grey-title">Info</Typography>

            <Box sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Date:</Typography>
                        <Typography color="text.secondary" variant="overline">
                            {notification.date.toLocaleString()}
                        </Typography>
                    </Stack>
                    {text != null && (
                        <Stack direction="row" spacing={2}>
                            <Typography variant="overline">Message:</Typography>
                            <Typography
                                color="text.secondary"
                                variant="overline">
                                {text}
                            </Typography>
                        </Stack>
                    )}
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Detected: </Typography>
                        <Skeleton variant="text" />
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}
