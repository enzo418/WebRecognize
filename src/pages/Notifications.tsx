import React, { useState } from 'react';

import Typography from '@mui/material/Typography';

import Stack from '@mui/material/Stack';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Skeleton from '@mui/material/Skeleton';

// import Container from '@mui/material/Container';

// import Divider from '@mui/material/Divider';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import '../styles/Notifications.scss';

import config from '../config';

import Notification, { ENotificationType } from '../domain/Notification';
import Camera from '../domain/Camera';

import FilterNotification, {
    INotificationFilters,
} from '../components/FilterNotifications';
import { NavNotificationsTimeline } from '../components/NavNotificationsTimeline';
import { getEnumAt, getEnumKeysNames, getEnumNameAt } from '../utils/enum';
import {
    NotificationGroup,
    NotificationGroupTypeMap,
} from '../domain/NotificationGroup';
import {
    CircularProgress,
    FormControlLabel,
    LinearProgress,
    Switch,
} from '@mui/material';
import { notificationService } from '../services/api/Services';
import NotificationItem from '../components/Notification/NotificationItem';

type NotificationsProps = {};

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

export default class Notifications extends React.Component<
    NotificationsProps,
    NotificationsState
> {
    state: NotificationsState = {
        loading: true,
        notifications: [],
        cameras: [],
        currentNotificationIndex: -1,
        jumpToNewNotification: false,
        currentFilter: {
            active: false,
            after: null,
            before: null,
            fromCameras: [],
        },
    };

    notificationAudioPlayer: React.RefObject<any>;

    constructor(props: NotificationsProps) {
        super(props);

        this.notificationAudioPlayer = React.createRef();
    }

    getCamerasFromNotifications = (nots: NotificationGroup[]) => {
        const cams: Camera[] = [];
        nots.forEach(not => {
            if (!cams.find(cam => cam.id === not.camera.id)) {
                cams.push(not.camera);
            }
        });

        return cams;
    };

    componentWillUnmount() {
        notificationService.unsubscribe(this.handleNewNotification);
    }

    filterNotifications = (filter: INotificationFilters) => {
        console.log('filtering: ', filter);
        if (filter.active) {
            if (filter.before && filter.after) {
                notificationService
                    .getBetween(filter.before, filter.after, 100)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            } else if (filter.before && !filter.after) {
                notificationService
                    .getBefore(filter.before, 100)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            } else if (!filter.before && filter.after) {
                notificationService
                    .getAfter(filter.after, 100)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            }
        } else {
            notificationService
                .getAll(100)
                .ok(this.processNotificationRequest)
                .fail(console.error);
        }

        // TODO: Add camera filters

        this.setState(() => ({
            currentFilter: filter,
        }));
    };

    groupNotifications = (nots: Notification[]) => {
        // group notifications by group id
        const grouped: Record<number, Notification[]> = nots.reduce(
            (groups: Record<number, Notification[]>, item) => {
                const group = groups[item.group] || [];
                group.push(item);
                groups[item.group] = group;
                return groups;
            },
            {},
        );

        const entries = Object.entries(grouped);

        // map [id, [textN, imageN, videoN]] to
        // {id, text:textN, image: imageN, ...}
        const mapped = entries.map(([groupID, groupNotifications]) => {
            const notificationsPerType: Record<string, Notification> = {};

            // get all the available notification types
            const nTypes = getEnumKeysNames(ENotificationType);

            let minDate = groupNotifications[0].date;
            const camera = groupNotifications[0].camera;

            // search each type on the group notifications
            nTypes.forEach((t: string) => {
                const found = groupNotifications.find(
                    not => not.type == getEnumAt(ENotificationType, t),
                );
                if (found) {
                    // to lower case since the propery is define as such
                    notificationsPerType[t.toLowerCase()] = found;

                    if (found.date < minDate) {
                        minDate = found.date;
                    }
                }
            });

            // build the group with the notfs found
            const group: NotificationGroup = {
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
        grouped: NotificationGroup[],
        addedANewGroup: boolean = true,
    ) => {
        console.log('Processing new here');

        let index: number = -1;

        if (grouped.length != 0) {
            index = this.state.currentNotificationIndex;
            if (
                (this.state.currentNotificationIndex == -1 &&
                    grouped.length > 0) ||
                (grouped.length > 0 && this.state.jumpToNewNotification) ||
                grouped.length < this.state.currentNotificationIndex
            ) {
                index = 0;
            } else if (addedANewGroup) {
                // since it will be added at front, we need to keep the UI in the
                // current notification (currentIndex + 1)
                index++;
            }
        }

        const cams: Camera[] = this.getCamerasFromNotifications(grouped);

        this.setState(() => ({
            notifications: grouped,
            cameras: cams,
            loading: false,
            currentNotificationIndex: index,
        }));
    };

    processNotificationRequest = (pNots: Notification | Notification[]) => {
        let nots: Array<Notification>;
        if (!Array.isArray(pNots)) {
            nots = [pNots];
        } else {
            nots = pNots;
        }

        const grouped = this.groupNotifications(nots);
        this.processNotifications(grouped);
    };

    notificationVerifiesFilter = (
        n: Notification,
        filter: INotificationFilters,
    ) => {
        let isValid = true;

        if (filter.before != null && n.date > filter.before) {
            isValid = false;
        }

        if (filter.after != null && n.date < filter.after) {
            isValid = false;
        }

        if (
            filter.fromCameras.length > 0 &&
            filter.fromCameras.includes(n.camera.id)
        ) {
            isValid = false;
        }

        return isValid;
    };

    handleNewNotification = (notifications: Notification[]) => {
        return new Promise((resolve, reject) => {
            let addedANewGroup: boolean = false;
            notifications.forEach(n => {
                if (
                    this.state.currentFilter.active &&
                    !this.notificationVerifiesFilter(
                        n,
                        this.state.currentFilter,
                    )
                ) {
                    return resolve(false);
                }

                // find if the notification belongs to some group
                // that already exists
                const group = this.state.notifications.find(
                    group => group.groupID == n.group,
                );

                const type: string = getEnumNameAt(
                    ENotificationType,
                    n.type,
                    true,
                );
                const typeMapped = type as keyof NotificationGroupTypeMap;
                const typedNotification =
                    n as NotificationGroupTypeMap[typeof typeMapped];

                // if found, add it to the the group
                if (group) {
                    // const gkey = type as keyof typeof group;
                    if (group.hasOwnProperty(type)) {
                        reject(
                            new Error(
                                `There was already a notification of this type! ${group} ${n.type}`,
                            ),
                        );
                    } else {
                        Object(group)[typeMapped] = typedNotification;
                    }
                } else {
                    const newGroup: NotificationGroup = {
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

    onChangeJumpToNewNotification = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState(() => ({
            jumpToNewNotification: event.target.checked,
        }));
    };

    onChangeNotification = (n: NotificationGroup) => {
        const index = this.state.notifications.indexOf(n);

        this.setState(() => ({
            currentNotificationIndex: index,
            jumpToNewNotification: false,
        }));
    };

    componentDidMount() {
        this.notificationAudioPlayer.current.volume = 0.1;
        notificationService.subscribe(this.handleNewNotification);

        notificationService
            .getAll(100)
            .ok(this.processNotificationRequest)
            .fail(console.error);
    }

    render() {
        return (
            <>
                <FilterNotification
                    onFilter={this.filterNotifications}
                    cameras={this.state.cameras}></FilterNotification>

                {!this.state.loading &&
                    this.state.currentNotificationIndex != -1 && (
                        <Box sx={{ flexGrow: 1, pt: '15px', pl: '15px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    this.state
                                                        .jumpToNewNotification
                                                }
                                                onChange={
                                                    this
                                                        .onChangeJumpToNewNotification
                                                }
                                            />
                                        }
                                        label="Automatically Jump to new notification"
                                    />

                                    <NavNotificationsTimeline
                                        notifications={this.state.notifications}
                                        currentIndex={
                                            this.state.currentNotificationIndex
                                        }
                                        cameras={this.state.cameras}
                                        onChangeNotification={
                                            this.onChangeNotification
                                        }></NavNotificationsTimeline>
                                </Grid>
                                <NotificationItem
                                    notifications={this.state.notifications}
                                    currentNotificationIndex={
                                        this.state.currentNotificationIndex
                                    }
                                />
                            </Grid>
                        </Box>
                    )}

                {this.state.loading && (
                    <Box className="centered" sx={{ pt: '10%', height: '50%' }}>
                        <LinearProgress sx={{ width: '80%' }} />
                    </Box>
                )}

                {!this.state.loading &&
                    this.state.currentNotificationIndex == -1 && (
                        <Typography>There are no notifications</Typography>
                    )}

                <audio ref={this.notificationAudioPlayer}>
                    <source src="/tone1.wav" type="audio/x-wav" />
                </audio>
            </>
        );
    }
}
