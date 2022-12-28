import { Button, SxProps } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Notification from '../../domain/Notification';
import { notificationService } from '../../services/api/Services';
import { useNavigate } from 'react-router-dom';

interface NotificationDebugVideoProps {
    notification: Notification;
    sx?: SxProps;
}

export default function NotificationDebugVideo(
    props: NotificationDebugVideoProps,
) {
    const [fetching, setFetching] = useState<boolean>(true);
    const [isReclaimed, setReclaimed] = useState<boolean>(false);
    const [debugBufferID, setDebugBufferID] = useState<string | null>(null);
    const [isNotAvailable, setIsNotAvailable] = useState<boolean | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        notificationService
            .getNotificationDebugBuffer(props.notification.group)
            .ok(res => {
                setFetching(false);
                setReclaimed(res.reclaimed);
                if (res.reclaimed && res.videoBufferID)
                    setDebugBufferID(res.videoBufferID);
            })
            .fail(e => {
                console.debug(e);

                if (e.status == 404 || e.status == 400) {
                    setIsNotAvailable(true);
                }
            });
    }, [props.notification.group]);

    const onDebugBuffer = () => {
        if (isReclaimed) {
            navigate(
                `/configuration/${props.notification.configurationID}/general/camera/${props.notification.camera.id}/blobs/threshold-parameters?videoBufferID=${debugBufferID}`,
            );
        } else {
            setFetching(true);
            notificationService
                .tryCreateDebugBuffer(props.notification.group)
                .ok(({ videoBufferID }) => {
                    setFetching(false);
                    setReclaimed(true);
                    setDebugBufferID(videoBufferID);

                    navigate(
                        `/configuration/${props.notification.configurationID}/general/camera/${props.notification.camera.id}/blobs/threshold-parameters?videoBufferID=${videoBufferID}`,
                    );
                })
                .fail(e => {
                    console.debug(e);

                    if (e.status == 404 || e.status == 400) {
                        setIsNotAvailable(true);
                    }
                });
        }
    };

    let sx: SxProps = {
        borderColor: 'Highlight',
    };

    return (
        <Button
            sx={Object.assign(sx, props.sx)}
            variant="outlined"
            color="inherit"
            disabled={fetching || (isNotAvailable !== null && isNotAvailable)}
            onClick={onDebugBuffer}>
            Debug notification video
        </Button>
    );
}
