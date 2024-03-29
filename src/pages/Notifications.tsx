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
    Drawer,
    FormControlLabel,
    LinearProgress,
    Paper,
    Switch,
    useMediaQuery,
} from '@mui/material';
import { notificationService } from '../services/api/Services';
import NotificationItem from '../components/Notification/NotificationItem';

type NotificationsProps = {
    isSmallScreen: boolean;
};

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

    showTimeline: boolean;

    currentPage: number;
    hasMorePages: boolean;
};

class Notifications extends React.Component<
    NotificationsProps,
    NotificationsState
> {
    pendingPromise: any;

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
        showTimeline: false,
        currentPage: 0, // first = 1 but it increments it
        hasMorePages: true,
    };

    notificationAudioPlayer: React.RefObject<any>;

    constructor(props: NotificationsProps) {
        super(props);

        this.notificationAudioPlayer = React.createRef();

        this.toggleTimeline = this.toggleTimeline.bind(this);
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

    filterNotifications = (filter: INotificationFilters) => {
        console.log('filtering: ', filter);

        this.setState(
            () => ({
                currentFilter: filter,
                currentPage: 1,
                hasMorePages: true,
            }),
            this.fetchNotificationsNextPage,
        );
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
        groupedIsNewerThatCurrent: boolean = false,
    ) => {
        let index: number = this.state.currentNotificationIndex;

        if (grouped.length != 0) {
            if (
                (this.state.currentNotificationIndex == -1 &&
                    grouped.length > 0) ||
                (grouped.length > 0 && this.state.jumpToNewNotification) ||
                grouped.length < this.state.currentNotificationIndex
            ) {
                index = 0;
            } else if (addedANewGroup && groupedIsNewerThatCurrent) {
                // since it will be added at front, we need to keep the UI in the
                // current notification (currentIndex + 1)
                index++;
            }
        } else if (
            this.state.currentNotificationIndex == -1 ||
            this.state.jumpToNewNotification
        ) {
            index = 0;
        }

        const cams: Camera[] = this.getCamerasFromNotifications(grouped);

        const uniqueCameras = Array.from(
            new Map(
                cams.concat(this.state.cameras || []).map(v => [v.id, v]),
            ).values(),
        );

        this.setState(prev => ({
            notifications: groupedIsNewerThatCurrent
                ? grouped.concat(prev.notifications)
                : prev.notifications.concat(grouped),
            cameras: uniqueCameras,
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

        if (nots.length == 0) {
            this.setState(() => ({
                hasMorePages: false,
                loading: false,
            }));
            return;
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
            let newGroups: Array<NotificationGroup> = [];

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
                const group = this.state.notifications
                    .concat(newGroups)
                    .find(group => group.groupID == n.group);

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
                    newGroups.unshift(newGroup);
                }

                addedANewGroup = addedANewGroup || group === undefined;
            });

            this.processNotifications(newGroups, addedANewGroup, true);

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

    fetchNotificationsNextPage = () => {
        // add a fetching flag if needed but nav notification timeline does this by itself

        const page = this.state.currentPage + 1;

        this.setState(() => ({ currentPage: page }));

        const filter = this.state.currentFilter;

        if (filter.active) {
            if (filter.before && filter.after) {
                notificationService
                    .getBetween(filter.before, filter.after, 3 * 20, page)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            } else if (filter.before && !filter.after) {
                notificationService
                    .getBefore(filter.before, 3 * 20, page)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            } else if (!filter.before && filter.after) {
                notificationService
                    .getAfter(filter.after, 3 * 20, page)
                    .ok(this.processNotificationRequest)
                    .fail(console.error);
            }
        } else {
            this.pendingPromise = notificationService
                .getAll(3 * 20, page)
                .ok(this.processNotificationRequest)
                .fail(console.error);
        }

        // TODO: Add camera filters
    };

    componentDidMount() {
        notificationService.subscribe(this.handleNewNotification);

        this.fetchNotificationsNextPage();
    }

    componentWillUnmount() {
        if (this.pendingPromise) this.pendingPromise.cancel();
        notificationService.unsubscribe(this.handleNewNotification);
    }

    toggleTimeline() {
        this.setState(prev => ({
            ...prev,
            showTimeline: !prev.showTimeline,
        }));
    }

    render() {
        const LeftPanel = (
            <>
                <FormControlLabel
                    control={
                        <Switch
                            checked={this.state.jumpToNewNotification}
                            onChange={this.onChangeJumpToNewNotification}
                        />
                    }
                    label="Automatically Jump to new notification"
                />
                <NavNotificationsTimeline
                    notifications={this.state.notifications}
                    currentIndex={this.state.currentNotificationIndex}
                    cameras={this.state.cameras}
                    onChangeNotification={this.onChangeNotification}
                    onFetchNextPage={this.fetchNotificationsNextPage}
                    hasMorePages={
                        this.state.hasMorePages
                    }></NavNotificationsTimeline>
            </>
        );

        return (
            <>
                <FilterNotification
                    onFilter={this.filterNotifications}
                    cameras={this.state.cameras}></FilterNotification>

                {!this.state.loading &&
                    this.state.currentNotificationIndex != -1 && (
                        <Box sx={{ flexGrow: 1, pt: '15px', pl: '15px' }}>
                            <Grid container spacing={2}>
                                {!this.props.isSmallScreen && (
                                    <Grid item xs={2}>
                                        {LeftPanel}
                                    </Grid>
                                )}
                                {this.props.isSmallScreen && (
                                    <Drawer
                                        open={this.state.showTimeline}
                                        onClose={this.toggleTimeline}
                                        ModalProps={{
                                            keepMounted: true,
                                        }}>
                                        <Paper
                                            elevation={0}
                                            sx={{ padding: '10px' }}>
                                            {LeftPanel}
                                        </Paper>
                                    </Drawer>
                                )}
                                <NotificationItem
                                    notifications={this.state.notifications}
                                    currentNotificationIndex={
                                        this.state.currentNotificationIndex
                                    }
                                    leftPanelWidth={2}
                                    isSmallScreen={this.props.isSmallScreen}
                                    onShowTimeline={this.toggleTimeline}
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
                    (this.state.currentNotificationIndex == -1 ||
                        !this.state.notifications.length) && (
                        <Typography padding={'10px'}>
                            There are no notifications
                        </Typography>
                    )}
            </>
        );
    }
}

const withSmallScreen = (Component: any) => {
    return (props: any) => {
        const isSmallScreen = useMediaQuery('(max-width:980px)');

        return <Component isSmallScreen={isSmallScreen} {...props} />;
    };
};

export default withSmallScreen(Notifications);
