import React from 'react';

import Typography from '@mui/material/Typography';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Stack from '@mui/material/Stack';

import DatePicker from '@mui/lab/DatePicker';
import TextField, { TextFieldProps } from '@mui/material/TextField';

import Camera from '../domain/Camera';

import Button from '@mui/material/Button';
import CamerasSelector from './CamerasSelector';

type CameraID = Camera['id'];

export interface INotificationFilters {
    active: boolean;

    before: Date | null;
    after: Date | null;
    fromCameras: CameraID[];
}

export interface IFilterComponentProps {
    onFilter: (filter: INotificationFilters) => any;
    cameras: Camera[];
}

function FilterNotification(props: IFilterComponentProps) {
    const [dateFrom, setValueDateFrom] = React.useState<Date | null>(null);
    const [dateTo, setValueDateTo] = React.useState<Date | null>(null);

    const [camerasSelected, setCamerasSelected] = React.useState<CameraID[]>(
        [],
    );

    const filter: INotificationFilters = {
        before: null,
        after: null,
        fromCameras: [],
        active: false,
    };

    const handleFilterButton = () => {
        filter.active = true;
        filter.before = dateTo;
        filter.after = dateFrom;
        filter.fromCameras = camerasSelected;
        props.onFilter(filter);
    };

    const handleClearFilterButton = () => {
        filter.active = false;
        props.onFilter(filter);
    };

    const handleDateFromChange = (value: Date | null) => {
        if (!dateTo || (value && dateTo >= value)) {
            setValueDateFrom(value);
        } else {
            // display error
        }
    };

    const handleDateToChange = (value: Date | null) => {
        if (!dateFrom || (value && dateFrom <= value)) {
            setValueDateTo(value);
        } else {
            // display error
        }
    };

    return (
        <div>
            <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header">
                    <Typography>Filters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <CamerasSelector
                        setCameras={setCamerasSelected}
                        cameras={props.cameras}
                        camerasSelected={camerasSelected}
                        titleText={{
                            display: true,
                            text: 'Cameras',
                        }}
                    />

                    <Typography
                        className="grey-title"
                        variant="body1"
                        gutterBottom>
                        Between this dates
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <DatePicker
                            label="From"
                            value={dateFrom}
                            onChange={(newValue: Date | null) => {
                                handleDateFromChange(newValue);
                            }}
                            renderInput={(params: any) => (
                                <TextField {...params} />
                            )}
                        />

                        <DatePicker
                            label="To"
                            value={dateTo}
                            onChange={(newValue: Date | null) => {
                                handleDateToChange(newValue);
                            }}
                            renderInput={(params: any) => (
                                <TextField {...params} />
                            )}
                        />
                    </Stack>
                </AccordionDetails>
                <Button onClick={handleFilterButton}>Filter</Button>
                <Button onClick={handleClearFilterButton}>Clear Filters</Button>
            </Accordion>
        </div>
    );
}

export default FilterNotification;
