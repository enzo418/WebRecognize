import {
    Grid,
    FormControlLabel,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Stack,
    Link,
} from '@mui/material';
import React from 'react';
import { useConfiguration } from '../../context/configurationContext';
import { HelpPopover } from '../IconPopover';
import {
    SelectConfigurationField,
    SwitchConfigurationField,
    TextConfigurationField,
} from './configurationField';

export default function NotificationsLocalConfiguration(props: any) {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();
    const commonData = { getFieldCB, updateCB, getInitialValue };

    return (
        <Grid container spacing={{ xs: 2, md: 1 }}>
            <Grid item xs={12} sm={12} md={12}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'localWebConfiguration/enabled',
                                defaultValue: false,
                            }}
                        />
                    }
                    label="Send notifications to web"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <Divider light />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <TextConfigurationField
                    label="Web server url"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'localWebConfiguration/webServerUrl',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <Divider light />
                <Typography sx={{ pt: '10px' }}>
                    After sending a notification we set a timer and if a new
                    notification is marked as to send but the timer has not
                    finished, then we discard it. Choose a large value (~10s) to
                    avoid an overload if many events occur in a row but not too
                    long.
                </Typography>
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    label="Seconds to wait between TEXT notifications"
                    variant="standard"
                    type="number"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'localWebConfiguration/secondsBetweenTextNotification',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    label="Seconds to wait between IMAGE notifications"
                    variant="standard"
                    type="number"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'localWebConfiguration/secondsBetweenImageNotification',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    label="Seconds to wait between VIDEO notifications"
                    variant="standard"
                    type="number"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'localWebConfiguration/secondsBetweenVideoNotification',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <Divider light />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth>
                    <InputLabel id="send-only">Send only of type</InputLabel>
                    <SelectConfigurationField
                        labelId="send-only"
                        label="Type"
                        data={{
                            ...commonData,
                            path: 'localWebConfiguration/notificationsToSend',
                            defaultValue: [],
                        }}
                        multiple
                        input={<OutlinedInput label="Send only of type" />}>
                        <MenuItem value={'Video'}>Video</MenuItem>
                        <MenuItem value={'Image'}>Image</MenuItem>
                        <MenuItem value={'Text'}>Text</MenuItem>
                    </SelectConfigurationField>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth>
                    <InputLabel id="send-only">
                        Draw movement trace on
                    </InputLabel>

                    <Stack direction="row">
                        <SelectConfigurationField
                            labelId="send-only"
                            label="Type"
                            data={{
                                ...commonData,
                                path: 'localWebConfiguration/drawTraceOfChangeOn',
                                defaultValue: [],
                            }}
                            multiple
                            input={<OutlinedInput label="Send only of type" />}
                            fullWidth>
                            <MenuItem value={'Video'}>Video</MenuItem>
                            <MenuItem value={'Image'}>Image</MenuItem>
                        </SelectConfigurationField>

                        <HelpPopover text="Before sending a notification we will draw lines describing the movement of whatever was detected" />
                    </Stack>
                </FormControl>
            </Grid>
        </Grid>
    );
}
