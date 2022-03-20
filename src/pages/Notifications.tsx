import React, {useState} from 'react';

import Typography from '@mui/material/Typography';

import Stack from '@mui/material/Stack';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Skeleton from '@mui/material/Skeleton';

// import Container from '@mui/material/Container';

// import Divider from '@mui/material/Divider';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {useEffect} from 'react';

import '../styles/Notifications.scss';

import CameraServiceMock from '../services/api/mock/CameraServiceMock';
import NotificationServiceMock from '../services/api/mock/NotificationServiceMock';
import Notification from '../domain/Notification';
import Camera from '../domain/Camera';

import FilterNotification, {INotificationFilters} from '../components/FilterNotifications';
import {NavNotificationsTimeline} from '../components/NavNotificationsTimeline';

function NotificationsBody() {
    return (
        <Stack spacing={1}>
            <Skeleton variant="text" />
            <Skeleton variant="rectangular" width={600} height={360} />
        </Stack>
    );
}

function NotificationsBodyInfo() {
    return (
        <Stack spacing={1}>
            <Typography className="grey-title">Info</Typography>

            <Box sx={{flexGrow: 1}}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Date: </Typography>
                        <Skeleton variant="text" />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Message: </Typography>
                        <Skeleton variant="text" />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Detected: </Typography>
                        <Skeleton variant="text" />
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}

interface IRightBarNotifProps {
    notifications: Notification[];
    currentIndex: number;
};

function NotificationsRightBarShowType() {
    const [view, setView] = React.useState('list');

    const handleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
        setView(nextView);
    };

    return (<>
        <Typography className="grey-title">Show</Typography>
        <ToggleButtonGroup
            orientation="vertical"
            value={view}
            exclusive
            onChange={handleChange}
            sx={{width: '90%'}}
        >
            <ToggleButton value="list" aria-label="list">
                < Typography>Video</Typography>
            </ToggleButton>
            <ToggleButton value="module" aria-label="module">
                <Typography>Image</Typography>
            </ToggleButton>
            <ToggleButton value="quilt" aria-label="quilt">
                <Typography>Text</Typography>
            </ToggleButton>
        </ToggleButtonGroup>
    </>);
}


function NotificationsRightBar(props:IRightBarNotifProps) {
    return (
        <Stack spacing={12}>
            {/* <div>
                <NotificationsRightBarMoveTo {...props}></NotificationsRightBarMoveTo>
            </div>*/}

            <div>
                <NotificationsRightBarShowType></NotificationsRightBarShowType>
            </div>
        </Stack>
    );
}

function Notifications() {
    const cameraService = new CameraServiceMock();
    const notificationService = new NotificationServiceMock(cameraService);

    // yes, to show a progress indicator
    const [loading, setLoading] = useState<boolean>(true);

    // yes
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // state needed since all the content displayed will change if this changes
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState<number | null>(null);

    // state needed? Yes, filter depends on it to update its elements
    const [cameras, setCameras] = useState<Camera[]>([]);

    const setCamerasFromNotifications = (nots:Notification[]) => {
        const cams:Camera[] = [];
        nots.forEach((not) => {
            if (!cams.find((cam) => cam.id === not.camera.id)) {
                cams.push(not.camera);
            }
        });

        setCameras(cams);
    };

    const filterNotifications = (filter:INotificationFilters) => {
        console.log(filter);
    };

    const processNotifications = (nots:Notification[]) => {
        setNotifications(nots);

        if (!currentNotificationIndex) {
            setCurrentNotificationIndex(nots.length-1);
        }

        setCamerasFromNotifications(nots);

        // setTimeout(() => {
        //    console.log('now');
        //    processNotifications(nots.slice(1, 3));
        // }, 7000);

        setLoading(false);
    };

    const processNotificationRequest = (response:Promise<Notification | Notification[]>) => {
        response.then((responseNots:Notification | Notification[]) => {
            let nots:Array<Notification>;

            if (!Array.isArray(responseNots)) {
                nots = [responseNots];
            } else {
                nots = responseNots;
            }

            processNotifications(nots);
        });
    };

    useEffect(() => {
        processNotificationRequest(notificationService.getAll());

        // function handleStatusChange(status) {
        //     setIsOnline(status.isOnline);
        // }

        // ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);

        // Specify how to clean up after this effect:
        // return function cleanup() {
        //     ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
        // };
    }, []);

    return (<>
        <FilterNotification
            onFilter={filterNotifications}
            cameras={cameras}></FilterNotification>

        {!loading && currentNotificationIndex != null &&
            <Box sx={{flexGrow: 1}}>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <NavNotificationsTimeline
                            notifications={notifications}
                            currentIndex={currentNotificationIndex}
                            cameras={cameras}
                        ></NavNotificationsTimeline>
                    </Grid>
                    <Grid item xs={8}>
                        <NotificationsBody></NotificationsBody>
                        <NotificationsBodyInfo></NotificationsBodyInfo>
                    </Grid>
                    <Grid item xs={2}>
                        <NotificationsRightBar
                            notifications={notifications}
                            currentIndex={currentNotificationIndex}
                        ></NotificationsRightBar>
                    </Grid>
                </Grid>
            </Box>
        }

        {loading && <Typography>Loading</Typography>}


        {!loading && currentNotificationIndex == null &&
        <Typography>There are no notifications</Typography>}

    </>
    );
}

export default Notifications;
