import React from 'react';
import { format } from 'date-fns';

import Typography from '@mui/material/Typography';

import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import RemoveIcon from '@mui/icons-material/Remove';

import Notification from '../domain/Notification';

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import {getPreviousOf, getFollowingOf} from '../utils/array';

interface ISimilarNotification {
    notification: Notification | null;
    distance: number;
};

interface IListSimilarNotificationElement {
    available:boolean;
    notificationId: string | null;
    buttonIcon: any;
    date: string | null;
    description: string;
};


const formatDate = (date:Date) => {
    return format(date, 'dd/MM/yyyy HH:mm');
};

interface INavNotificationsByDateProps {
    notifications: Notification[];
    currentIndex: number;
};

export default function NavNotificationsByDate(props:INavNotificationsByDateProps) {
    const {notifications, currentIndex} = props;

    const followingElements = 2;

    // slice includes the first but not the last
    const following:ISimilarNotification[] = getFollowingOf(
        notifications,
        currentIndex,
        followingElements,
        true).map((val, indx) => {
        return {
            notification: val,
            distance: indx + 1,
        };
    });

    const previousElements = 2;
    const previous:ISimilarNotification[] = getPreviousOf(
        notifications,
        currentIndex,
        previousElements,
        true).map((val, indx) => {
        return {
            notification: val,
            distance: previousElements - indx,
        };
    });

    const buttonsIcons: Record<string, Record<number, any>> = {
        'following': {
            1: <KeyboardArrowUpRoundedIcon/>,
            2: <KeyboardDoubleArrowUpRoundedIcon/>,
        },
        'previous': {
            1: <KeyboardArrowDownRoundedIcon />,
            2: <KeyboardDoubleArrowDownRoundedIcon />,
        }};

    const emptyDate:string = 'No element';

    const getSimilarListElement = (val:ISimilarNotification, type:string, index:number) => {
        const res:IListSimilarNotificationElement = {
            available: val.notification != null,
            notificationId: val.notification != null ? val.notification.id : type + index,
            buttonIcon: buttonsIcons[type][val.distance],
            date: val.notification != null ? formatDate(val.notification.date) : null,
            description: emptyDate,
        };

        return res;
    };

    const listElements:Array<IListSimilarNotificationElement> = following
        .reverse() // distance 1 = first element! we need to reverse it
        .map((val, i) => getSimilarListElement(val, 'following', i))
        .concat([{
            notificationId: notifications[currentIndex].id,
            available: false,
            buttonIcon: <RemoveIcon/>,
            date: null,
            description: formatDate(notifications[currentIndex].date),
        }])
        .concat(
            previous.map((val, i) => getSimilarListElement(val, 'previous', i)),
        );


    return (<>
        <Typography className="grey-title">Move to</Typography>

        {
            listElements.map((elem) => (
                <Stack
                    key={elem.notificationId}
                    direction="row"
                    spacing={2}
                    sx={{color: (elem.available ? '--':'text.secondary'), cursor: 'pointer'}}>
                    <Box sx={{flexGrow: 1}}>
                        <Grid container spacing={2}>
                            <Grid item xs={9}>
                                <Typography>
                                    {
                                        elem.available ? elem.date : elem.description
                                    }</Typography>
                            </Grid>

                            <Grid item xs={3}>
                                {elem.buttonIcon}
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            ))
        }
    </>);
}
