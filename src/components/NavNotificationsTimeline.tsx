import React from 'react';

import Camera from '../domain/Camera';

// import { formatRelative, format } from 'date-fns';
import format from '../lib/format';

import TimeLineAlternate, {
    ITimelineItem,
    ITimelineItemSectionSeparator,
    ClickCallback,
} from './TimelineAlternate';
import { ensure } from '../utils/error';
import { NotificationGroup } from '../domain/NotificationGroup';

interface INavNotificationsTimelineProps {
    hasMorePages: boolean;
    notifications: NotificationGroup[];
    currentIndex: number;
    cameras: Camera[];
    onChangeNotification: (notf: NotificationGroup) => any;
    onFetchNextPage: () => any;
}

const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm');
};

const formatDateWithoutTime = (date: Date) => {
    return format(date, 'iiii dd/MM/yyyy');
};

const formatDateOnlyTime = (date: Date) => {
    return format(date, 'HH:mm');
};

const datesAreSameDay = (d1: Date, d2: Date) => {
    return (
        d1.getDay() == d2.getDay() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getFullYear() == d2.getFullYear()
    );
};

export function NavNotificationsTimeline(
    props: INavNotificationsTimelineProps,
) {
    const { notifications, currentIndex, cameras } = props;
    const items: Array<ITimelineItem | ITimelineItemSectionSeparator> = [];

    let lastDate: Date | null = null;
    notifications.forEach((n, i) => {
        if (lastDate == null || !datesAreSameDay(n.date, lastDate)) {
            lastDate = n.date;

            const item: ITimelineItemSectionSeparator = {
                isSeparator: true,
                text: formatDateWithoutTime(n.date),
                // textColor: 'gray',
                separatorColor: '#6b6b6b1c',
            };
            items.push(item);
        }

        const item: ITimelineItem = {
            isSeparator: false,
            id: n.groupID,
            left: formatDateOnlyTime(n.date),
            right: n.camera.name,
            grayOut: 'none',
            knobColor: !(parseInt(n.camera.id) % 3) ? '#f02f08' : 'secondary',
            mark: i == currentIndex,
        };
        items.push(item);
    });

    const onclickCallback: ClickCallback = (id: ITimelineItem['id']) => {
        const notf: NotificationGroup = ensure(
            notifications.find(not => not.groupID == id),
        );
        props.onChangeNotification(notf);
    };

    return (
        <TimeLineAlternate
            elements={items}
            onclick={onclickCallback}
            onFetchNextPage={props.onFetchNextPage}
            hasMorePages={props.hasMorePages}
        />
    );
}
