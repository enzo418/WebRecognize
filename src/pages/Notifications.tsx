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
import Notification,
{
    ENotificationType,
    MediaNotification,
    TextNotification,
} from '../domain/Notification';
import Camera from '../domain/Camera';

import FilterNotification, {INotificationFilters} from '../components/FilterNotifications';
import {NavNotificationsTimeline} from '../components/NavNotificationsTimeline';
import {getEnumAt, getEnumKeysNames} from '../utils/enum';
import {NotificationGroup} from '../domain/NotificationGroup';
import {ensure} from '../utils/error';
import {intersect} from '../utils/array';
import SkeletonImage from '../components/SkeletonImage';
import SkeletonVideo from '../components/SkeletonVideo';

interface INotificationBodyDisplayMediaProps {
    mediaURI: string;
};

function NotificationBodyDisplayImage(props:INotificationBodyDisplayMediaProps) {
    return <SkeletonImage src={props.mediaURI}></SkeletonImage>;
}

function NotificationBodyDisplayVideo(props:INotificationBodyDisplayMediaProps) {
    return <SkeletonVideo src={props.mediaURI}></SkeletonVideo>;
}

interface INotificationBodyDisplayTextProps {
    text: string;
};

function NotificationBodyDisplayText(props:INotificationBodyDisplayTextProps) {
    return (
        <Box
            sx={{
                'minWidth': '100vw',
                'minHeight': '30vh',
            }}
        ><Typography>{props.text}</Typography></Box>);
}

interface INotificationBodyDisplayProps {
    notification: Notification;
};

function NotificationBodyDisplay(props:INotificationBodyDisplayProps) {
    const {notification} = props;

    let element = null;

    switch (notification.type) {
    case ENotificationType.IMAGE:
        element = <NotificationBodyDisplayImage
            mediaURI={(notification as MediaNotification).mediaURI}
        />;
        break;
    case ENotificationType.VIDEO:
        element = <NotificationBodyDisplayVideo
            mediaURI={(notification as MediaNotification).mediaURI}
        />;
        break;
    case ENotificationType.TEXT:
        element = <NotificationBodyDisplayText
            text={(notification as TextNotification).text}
        />;
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

interface INotificationItemBodyProps {
    notification: Notification;
    text: string | null;
};

function NotificationItemBody(props:INotificationItemBodyProps) {
    const {notification, text} = props;

    return (
        <Stack spacing={1}>
            <Typography className="grey-title">Info</Typography>

            <Box sx={{flexGrow: 1}}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">
                            Date:</Typography>
                        <Typography color="text.secondary" variant="overline">
                            {notification.date.toLocaleString()}
                        </Typography>
                    </Stack>
                    {
                        text != null &&
                        (<Stack direction="row" spacing={2}>
                            <Typography variant="overline">
                                Message:
                            </Typography>
                            <Typography color="text.secondary" variant="overline">
                                {text}
                            </Typography>
                        </Stack>)
                    }
                    <Stack direction="row" spacing={2}>
                        <Typography variant="overline">Detected: </Typography>
                        <Skeleton variant="text" />
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
}

interface INotificationTypeSelectorProps {
    type: string;
    onChange: (t:string) => void;
    allTypes: string[];
    selectableTypes: string[];
};

function NotificationTypeSelector(props:INotificationTypeSelectorProps) {
    const {type, onChange, allTypes, selectableTypes} = props;

    const handleChange = (event: React.MouseEvent<HTMLElement>, newType: string) => {
        onChange(newType);
    };

    return (<>
        <Typography className="grey-title">Show</Typography>
        <ToggleButtonGroup
            orientation="vertical"
            value={type}
            exclusive
            onChange={handleChange}
            sx={{width: '90%'}}
        >
            {allTypes.map((t) => (
                <ToggleButton
                    key={t}
                    value={t}
                    aria-label={t}
                    disabled={selectableTypes.indexOf(t) == -1}
                >
                    <Typography>{t}</Typography>
                </ToggleButton>),
            )}
        </ToggleButtonGroup>
    </>);
}

interface INotificationItemProps {
    notifications: NotificationGroup[];
    currentNotificationIndex: number;
};

function NotificationItem(props:INotificationItemProps) {
    const {notifications, currentNotificationIndex} = props;

    // notification is the group notification
    const notification = notifications[currentNotificationIndex];

    const types:string[] = ensure(getEnumKeysNames(ENotificationType, true));
    const selectableTypes:string[] = intersect(Object.keys(notification), types);

    const defaulttype = selectableTypes[0];

    const [type, setType] = useState<string>(defaulttype);

    // typed notification is a notification with an image/video or text
    const [typedNotification, setTypedNotification] = useState<Notification>(
        Object(notification)[type],
    );

    const handleChangeType = (t:string) => {
        if (notification.hasOwnProperty(t)) {
            setType(t);
            setTypedNotification(ensure(Object(notification)[t]));
        }
    };

    // condition 1: if the notification group changed, check if the old type is
    // available on the new one
    // condition 2: if it changed the notification group then change the typed notf.
    if (!notification.hasOwnProperty(type) || typedNotification.group != notification.groupID) {
        let t = type;

        if (!notification.hasOwnProperty(type)) {
            setType(defaulttype);
            t = defaulttype;
        }

        setTypedNotification(ensure(Object(notification)[t]));
    }

    let text:string|null = null;

    if (notification.text) {
        text = notification.text.text;
    }

    return (<>
        <Grid item xs={8}>
            <NotificationBodyDisplay
                notification={typedNotification}
            />

            <NotificationItemBody
                notification={typedNotification}
                text={text}/>
        </Grid>
        <Grid item xs={2}>
            <NotificationTypeSelector
                type={type}
                onChange={handleChangeType}
                allTypes={types}
                selectableTypes={selectableTypes}
            />
        </Grid>
    </>);
}

function Notifications() {
    const cameraService = new CameraServiceMock();
    const notificationService = new NotificationServiceMock(cameraService);

    // yes, to show a progress indicator
    const [loading, setLoading] = useState<boolean>(true);

    // yes
    const [notifications, setNotifications] = useState<NotificationGroup[]>([]);

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

    const groupNotifications = (nots:Notification[]) => {
        // group notifications by group id
        const grouped:Record<number, Notification[]> = nots
            .reduce((groups:Record<number, Notification[]>, item) => {
                const group = (groups[item.group] || []);
                group.push(item);
                groups[item.group] = group;
                return groups;
            }, {});

        const entries = Object.entries(grouped);

        // map [id, [textN, imageN, videoN]] to
        // {id, text:textN, image: imageN, ...}
        return entries.map(([groupID, groupNotifications]) => {
            const notificationsPerType:Record<string, Notification> = {};

            // get all the available notification types
            const nTypes = getEnumKeysNames(ENotificationType);

            let minDate = groupNotifications[0].date;
            const camera = groupNotifications[0].camera;

            // search each type on the group notifications
            nTypes.forEach((t:string) => {
                const found = groupNotifications
                    .find((not) =>
                        not.type == getEnumAt(ENotificationType, t));
                if (found) {
                    // to lower case since the propery is define as such
                    notificationsPerType[t.toLowerCase()] = found;

                    if (found.date < minDate) {
                        minDate = found.date;
                    }
                }
            });

            // build the group with the notfs found
            const group : NotificationGroup = {
                groupID: parseInt(groupID),
                date: minDate,
                camera,
                ...notificationsPerType,
            };

            return group;
        });
    };

    const processNotifications = (nots:Notification[]) => {
        const grouped = groupNotifications(nots);

        setNotifications(grouped);

        if (!currentNotificationIndex && nots.length > 0) {
            setCurrentNotificationIndex(0);
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

    const onChangeNotification = (n:NotificationGroup) => {
        const index = notifications.indexOf(n);
        setCurrentNotificationIndex(index);
    };

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
                            onChangeNotification={onChangeNotification}
                        ></NavNotificationsTimeline>
                    </Grid>
                    <NotificationItem
                        notifications={notifications}
                        currentNotificationIndex={currentNotificationIndex}/>
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
