import React from 'react';

import Notification from '../domain/Notification';
import Camera from '../domain/Camera';

import { format } from 'date-fns';

import TimeLineAlternate, {ITimelineItem} from './TimelineAlternate';

interface INavNotificationsTimelineProps {
    notifications: Notification[];
    currentIndex: number;
    cameras: Camera[];
};

const formatDate = (date:Date) => {
    return format(date, 'dd/MM/yyyy HH:mm');
};

export function NavNotificationsTimeline(props: INavNotificationsTimelineProps) {
    const {notifications, currentIndex, cameras } = props;
    const items:ITimelineItem[] = notifications.map((n, i) => {
        return {
            id: n.id,
            left: formatDate(n.date),
            right: n.camera.name,
            grayOut: 'none',
            knobColor: (!(parseInt(n.camera.id) % 3) ? '#f02f08': 'secondary'),
        };
    });

    return <TimeLineAlternate elements={items}/>;
}
