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

import NotificationService from '../services/api/NotificationService';

import HttpClient from '../Http/HttpClient';

import config from '../config';

import Notification,
{
    ENotificationType,
    MediaNotification,
    TextNotification,
} from '../domain/Notification';
import Camera from '../domain/Camera';

import FilterNotification, {INotificationFilters} from '../components/FilterNotifications';
import {NavNotificationsTimeline} from '../components/NavNotificationsTimeline';
import {getEnumAt, getEnumKeysNames, getEnumNameAt} from '../utils/enum';
import {NotificationGroup, NotificationGroupTypeMap} from '../domain/NotificationGroup';
import {ensure} from '../utils/error';
import {intersect} from '../utils/array';
import SkeletonImage from '../components/SkeletonImage';
import SkeletonVideo from '../components/SkeletonVideo';
import {INotificationService} from '../services/api/interfaces/INotificationService';
import ICameraService from '../services/api/interfaces/ICameraService';
import {FormControlLabel, Switch} from '@mui/material';

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

type NewOmit<T, K extends PropertyKey> =
  { [P in keyof T as Exclude<P, K>]: T[P] };

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
    sx?: any;
};

function NotificationItemBody(props:INotificationItemBodyProps) {
    const {notification, text} = props;

    return (
        <Stack spacing={1} sx={props.sx}>
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

    console.log('item: ', {notifications, currentNotificationIndex});

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
                text={text}
                sx={{paddingTop: '15px'}}/>
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

class SingletonCameraService {
    private static instance: ICameraService;

    private constructor() {};

    public static getInstance() : ICameraService {
        if (!SingletonCameraService.instance) {
            SingletonCameraService.instance = new CameraServiceMock();
        }

        return SingletonCameraService.instance;
    }
};

class SingletonNotificationService {
    private static instance: INotificationService;

    private constructor() {};

    public static getInstance(cameraService:ICameraService) : INotificationService {
        if (!SingletonNotificationService.instance) {
            SingletonNotificationService.instance = new NotificationService(
                new HttpClient(config.server),
                cameraService,
            );
        }

        return SingletonNotificationService.instance;
    }
};

type NotificationsProps = { };

type NotificationsState = {
    loading: boolean;

    // notifications that are being shown
    notifications: NotificationGroup[];

    // current notification shown index
    currentNotificationIndex: number;

    // cameras from all the notification
    cameras: Camera[];

    // should jump to the new notification once it arrives
    jumpToNewNotification: boolean;

    currentFilter: INotificationFilters;
};

export default class Notifications extends React.Component<NotificationsProps, NotificationsState> {
    state:NotificationsState = {
        loading: false,
        notifications: [],
        cameras: [],
        currentNotificationIndex: -1,
        jumpToNewNotification: false,
        currentFilter: {active: false, after: null, before: null, fromCameras: []},
    };

    notificationService:INotificationService;

    notificationAudioPlayer: React.RefObject<any>;

    constructor(props:NotificationsProps) {
        super(props);

        this.notificationService = SingletonNotificationService.getInstance(
            SingletonCameraService.getInstance(),
        );

        this.processNotificationRequest(this.notificationService.getAll(100));

        this.notificationAudioPlayer = React.createRef();
    }

    getCamerasFromNotifications = (nots:NotificationGroup[]) => {
        const cams:Camera[] = [];
        nots.forEach((not) => {
            if (!cams.find((cam) => cam.id === not.camera.id)) {
                cams.push(not.camera);
            }
        });

        return cams;
    };

    componentWillUnmount() {
        this.notificationService.unsubscribe(this.handleNewNotification);
    }

    filterNotifications = (filter:INotificationFilters) => {
        console.log('filtering: ', filter);
        if (filter.active) {
            if (filter.before && filter.after) {
                this.processNotificationRequest(
                    this.notificationService.getBetween(filter.before, filter.after, 100),
                );
            } else if (filter.before && !filter.after) {
                this.processNotificationRequest(
                    this.notificationService.getBefore(filter.before, 100),
                );
            } else if (!filter.before && filter.after) {
                this.processNotificationRequest(
                    this.notificationService.getAfter(filter.after, 100),
                );
            }
        } else {
            this.processNotificationRequest(this.notificationService.getAll(100));
        }

        // TODO: Add camera filters

        this.setState(() => ({
            currentFilter: filter,
        }));
    };

    groupNotifications = (nots:Notification[]) => {
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
        const mapped = entries.map(([groupID, groupNotifications]) => {
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

        // Group orders by key so smallest group id goes first
        // but that means olders notification will appear at the
        // top in the timeline. To solve that we reverse the order.
        return mapped.reverse();
    };

    processNotifications = (
        grouped:NotificationGroup[],
        addedANewGroup: boolean = true) => {
        console.log('Processing new here');

        let index:number = -1;

        if (grouped.length != 0) {
            index = this.state.currentNotificationIndex;
            if (this.state.currentNotificationIndex == -1 && grouped.length > 0 ||
                grouped.length > 0 && this.state.jumpToNewNotification ||
                grouped.length < this.state.currentNotificationIndex) {
                index = 0;
            } else if (addedANewGroup) {
                // since it will be added at front, we need to keep the UI in the
                // current notification (currentIndex + 1)
                index++;
            }
        }

        const cams:Camera[] = this.getCamerasFromNotifications(grouped);

        this.setState(() => ({
            notifications: grouped,
            cameras: cams,
            loading: false,
            currentNotificationIndex: index,
        }));
    };

    processNotificationRequest = (response:Promise<Notification | Notification[]>) => {
        response.then((responseNots:Notification | Notification[]) => {
            let nots:Array<Notification>;

            if (!Array.isArray(responseNots)) {
                nots = [responseNots];
            } else {
                nots = responseNots;
            }

            const grouped = this.groupNotifications(nots);
            this.processNotifications(grouped);
        });
    };

    notificationVerifiesFilter = (n:Notification, filter:INotificationFilters) => {
        let isValid = true;

        if (filter.before != null && n.date > filter.before) {
            isValid = false;
        }

        if (filter.after != null && n.date < filter.after) {
            isValid = false;
        }

        if (filter.fromCameras.length > 0 && filter.fromCameras.includes(n.camera.id)) {
            isValid = false;
        }

        return isValid;
    };

    handleNewNotification = (notifications:Notification[]) => {
        return new Promise((resolve, reject) => {
            let addedANewGroup: boolean = false;
            notifications.forEach((n) => {
                if (this.state.currentFilter.active &&
                    !this.notificationVerifiesFilter(n, this.state.currentFilter)) {
                    return resolve(false);
                }

                // find if the notification belongs to some group
                // that already exists
                const group = this.state.notifications.find((group) => group.groupID == n.group);

                const type:string = getEnumNameAt(ENotificationType, n.type, true);
                const typeMapped = type as keyof NotificationGroupTypeMap;
                const typedNotification = n as NotificationGroupTypeMap[typeof typeMapped];

                // if found, add it to the the group
                if (group) {
                    // const gkey = type as keyof typeof group;
                    if (group.hasOwnProperty(type)) {
                        reject(new Error(
                            `There was already a notification of this type! ${group} ${n.type}`,
                        ));
                    } else {
                        Object(group)[typeMapped] = typedNotification;
                    }
                } else {
                    const newGroup : NotificationGroup = {
                        groupID: n.group,
                        date: n.date,
                        camera: n.camera,
                    };
                    Object(newGroup)[typeMapped] = typedNotification;

                    // add it to the front since its the newer
                    this.state.notifications.unshift(newGroup);
                }

                addedANewGroup = addedANewGroup || group === undefined;

                console.log('Processing new');
            });

            this.processNotifications(this.state.notifications, addedANewGroup);

            this.notificationAudioPlayer.current.play();

            resolve(true);
        });
    };

    onChangeJumpToNewNotification = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(() => ({
            jumpToNewNotification: event.target.checked,
        }));
    };

    onChangeNotification = (n:NotificationGroup) => {
        const index = this.state.notifications.indexOf(n);

        this.setState(() => ({
            currentNotificationIndex: index,
            jumpToNewNotification: false,
        }));
    };

    componentDidMount() {
        this.notificationAudioPlayer.current.volume = 0.3;
        this.notificationService.subscribe(this.handleNewNotification);
    }

    render() {
        return (<>
            <FilterNotification
                onFilter={this.filterNotifications}
                cameras={this.state.cameras}></FilterNotification>

            {!this.state.loading && this.state.currentNotificationIndex != -1 &&
            <Box sx={{flexGrow: 1, pt: '15px', pl: '15px'}}>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <FormControlLabel
                            control={<Switch
                                checked={this.state.jumpToNewNotification}
                                onChange={this.onChangeJumpToNewNotification}
                            />}

                            label="Automatically Jump to new notification" />

                        <NavNotificationsTimeline
                            notifications={this.state.notifications}
                            currentIndex={this.state.currentNotificationIndex}
                            cameras={this.state.cameras}
                            onChangeNotification={this.onChangeNotification}
                        ></NavNotificationsTimeline>
                    </Grid>
                    <NotificationItem
                        notifications={this.state.notifications}
                        currentNotificationIndex={this.state.currentNotificationIndex}/>
                </Grid>
            </Box>
            }

            {this.state.loading && <Typography>Loading</Typography>}


            {!this.state.loading && this.state.currentNotificationIndex == -1 &&
            <Typography>There are no notifications</Typography>}

            <audio ref={this.notificationAudioPlayer}>
                <source src="/tone1.wav" type="audio/x-wav" />
            </audio>
        </>
        );
    }
}
