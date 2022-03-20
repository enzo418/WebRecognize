import React, {useState} from 'react';

import Typography from '@mui/material/Typography';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import DatePicker from '@mui/lab/DatePicker';
import TextField from '@mui/material/TextField';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import Skeleton from '@mui/material/Skeleton';

// import Container from '@mui/material/Container';

// import Divider from '@mui/material/Divider';

import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {useEffect} from 'react';

import '../styles/Notifications.scss';

import CameraServiceMock from '../services/api/mock/CameraServiceMock';
import NotificationServiceMock from '../services/api/mock/NotificationServiceMock';
import Notification from '../domain/Notification';
import Camera from '../domain/Camera';

import Button from '@mui/material/Button';

type CameraID = Camera['id'];

interface NotificationFilters {
    before: Date | null;
    after: Date | null;
    fromCameras: CameraID[];
};

interface FilterComponentProps {
    onFilter: (filter:NotificationFilters) => any;
    cameras: Camera[];
};

function FilterNotificationAccordion(props:FilterComponentProps) {
    const [dateFrom, setValueDateFrom] = React.useState<Date | null>(null);
    const [dateTo, setValueDateTo] = React.useState<Date | null>(null);

    const [camerasSelected, setCamerasSelected] = React.useState<CameraID[]>([]);

    const filter:NotificationFilters = {
        before: null,
        after: null,
        fromCameras: [],
    };

    const handleFilterButton = () => {
        filter.before = dateTo;
        filter.after = dateFrom;
        filter.fromCameras = camerasSelected;
        props.onFilter(filter);
    };

    const toggleCamerasSelected = (id:string) => {
        setCamerasSelected((currentValues) => {
            if (currentValues.indexOf(id) >= 0) {
                return currentValues.filter((cid) => cid != id);
            } else {
                return currentValues.concat([id]);
            }
        });
    };

    const handleDateFromChange = (value:Date| null) => {
        if (!dateTo || value && dateTo >= value) {
            setValueDateFrom(value);
        } else {
            // display error
        }
    };

    const handleDateToChange = (value:Date | null) => {
        if (!dateFrom || value && dateFrom <= value) {
            setValueDateTo(value);
        } else {
            // display error
        }
    };

    return (
        <div>
            <Accordion TransitionProps={{unmountOnExit: true}} >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography>Filters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography
                        className="grey-title"
                        variant="body1"
                        gutterBottom>Cameras</Typography>

                    <Stack direction="row" spacing={2} sx={{flexWrap: 'wrap'}}>
                        {
                            props.cameras.map((camera, i) => {
                                return <FormControlLabel
                                    key={camera.id}
                                    control={<Checkbox />}
                                    label={camera.name}
                                    checked={
                                        camerasSelected.indexOf(camera.id) >= 0
                                    }
                                    onClick={() => toggleCamerasSelected(camera.id)}
                                />;
                            })
                        }
                    </Stack>

                    <Typography
                        className="grey-title"
                        variant="body1"
                        gutterBottom>Between this dates</Typography>
                    <Stack direction="row" spacing={2}>
                        <DatePicker
                            label="From"
                            value={dateFrom}
                            onChange={(newValue) => {
                                handleDateFromChange(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />

                        <DatePicker
                            label="To"
                            value={dateTo}
                            onChange={(newValue) => {
                                handleDateToChange(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </Stack>
                </AccordionDetails>
                <Button onClick={handleFilterButton}>
                Filter
                </Button>
            </Accordion>
        </div>
    );
}

function NotificationsTimeline() {
    return (
        <React.Fragment>
            <Timeline position="alternate">
                <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">
                        09:30 am
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>Eat</TimelineContent>
                </TimelineItem>
                <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">
                        10:00 am
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>Code</TimelineContent>
                </TimelineItem>
                <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">
                        12:00 am
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>Sleep</TimelineContent>
                </TimelineItem>
                <TimelineItem>
                    <TimelineOppositeContent color="text.secondary">
                        9:00 am
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineDot />
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>Repeat</TimelineContent>
                </TimelineItem>
            </Timeline>
        </React.Fragment>
    );
}

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

function NotificationsRightBarMoveTo() {
    return (<>
        <Typography className="grey-title">Move to</Typography>
        <Stack direction="row" spacing={2}>
            <Typography>25/02/15 15:33</Typography>
            <KeyboardDoubleArrowUpRoundedIcon />
        </Stack>

        <Stack direction="row" spacing={2}>
            <Typography>23/02/15 15:33</Typography>
            <KeyboardArrowUpRoundedIcon />
        </Stack>

        <Stack direction="row" spacing={2}>
            <Typography>22/02/15 15:33</Typography>
            <KeyboardArrowDownRoundedIcon />
        </Stack>

        <Stack direction="row" spacing={2}>
            <Typography>20/02/15 15:33</Typography>
            <KeyboardDoubleArrowDownRoundedIcon />
        </Stack></>);
}

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

function NotificationsRightBar() {
    return (
        <Stack spacing={12}>
            <div>
                <NotificationsRightBarMoveTo></NotificationsRightBarMoveTo>
            </div>

            <div>
                <NotificationsRightBarShowType></NotificationsRightBarShowType>
            </div>
        </Stack>
    );
}

function Notifications() {
    const cameraService = new CameraServiceMock();
    const notificationService = new NotificationServiceMock(cameraService);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState<number>(0);
    const [cameras, setCameras] = useState<Camera[]>([]);

    const getCamerasFromNotifications = (nots:Notification[]) => {
        const cams:Camera[] = [];
        nots.forEach((not) => {
            if (!cams.find((cam) => cam.id === not.camera.id)) {
                cams.push(not.camera);
            }
        });
        setCameras(cams);
    };

    const filterNotifications = (filter:NotificationFilters) => {
        console.log(filter);
    };

    const processNotificationRequest = (response:Promise<Notification | Notification[]>) => {
        response.then((responseNots:Notification | Notification[]) => {
            let nots:Array<Notification>;

            if (!Array.isArray(responseNots)) {
                nots = [responseNots];
            } else {
                nots = responseNots;
            }

            setNotifications(nots);
            setCurrentNotificationIndex(nots.length-1);
            getCamerasFromNotifications(nots);
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
        <FilterNotificationAccordion
            onFilter={filterNotifications}
            cameras={cameras}></FilterNotificationAccordion>
        <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <NotificationsTimeline></NotificationsTimeline>
                </Grid>
                <Grid item xs={8}>
                    <NotificationsBody></NotificationsBody>
                    <NotificationsBodyInfo></NotificationsBodyInfo>
                </Grid>
                <Grid item xs={2}>
                    <NotificationsRightBar></NotificationsRightBar>
                </Grid>
            </Grid>
        </Box>

    </>
    );
}

export default Notifications;
