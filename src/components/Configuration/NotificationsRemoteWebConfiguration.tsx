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

// An element that can be marked as required (red *) at the front, else it leaves a space before it so all are aligned
// also, all their background color is like a markdown code block (grey)
const QueryParameter = ({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) => (
    <Typography
        variant="overline"
        display="block"
        gutterBottom
        sx={{
            width: 'fit-content',
            backgroundColor: 'grey.900',
            paddingLeft: !required ? '14px' : '4px',
            borderRadius: '4px',
            paddingRight: '8px',
            marginLeft: '10px',
            textTransform: 'lowercase',
            fontSize: '1rem',
        }}>
        {required && <span style={{ maxWidth: '8px', color: 'red' }}>* </span>}
        {children}
    </Typography>
);

export default function NotificationsRemoteWebConfiguration(props: any) {
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
                                path: 'remoteWebNotificationConfiguration/enabled',
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
                <Typography>
                    This is the endpoint that will receive the notification
                    call. The data will be passed as query parameters:
                </Typography>
                <QueryParameter required={true}>
                    id={'<notification id>'}
                </QueryParameter>
                <QueryParameter required={true}>
                    content_type={'<image|video|text>'}
                </QueryParameter>
                <QueryParameter required={false}>
                    camera_name={'<camera name>'}
                </QueryParameter>
                <QueryParameter required={false}>
                    content_uri={'<string url pointing to the resource>'}
                </QueryParameter>
                <QueryParameter required={false}>
                    person={'<number of people detected>'}
                </QueryParameter>

                <Typography
                    variant="body2"
                    color={'GrayText'}
                    gutterBottom
                    sx={{ mb: '10px', marginLeft: '10px' }}>
                    <span style={{ maxWidth: '8px', color: 'red' }}>*</span>{' '}
                    means the parameter will always be present
                </Typography>

                <TextConfigurationField
                    label="URL where to make the request"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'remoteWebNotificationConfiguration/endpointUrl',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <Divider light />
                <Typography sx={{ pt: '10px' }}>
                    After sending a notification, we set a timer. If a new
                    notification is marked as to send but the timer has not
                    finished, then we discard it. Choose a large value (~10s) to
                    avoid overload if many events occur in a row, but not too
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
                        path: 'remoteWebNotificationConfiguration/secondsBetweenTextNotification',
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
                        path: 'remoteWebNotificationConfiguration/secondsBetweenImageNotification',
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
                        path: 'remoteWebNotificationConfiguration/secondsBetweenVideoNotification',
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
                            path: 'remoteWebNotificationConfiguration/notificationsToSend',
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
                                path: 'remoteWebNotificationConfiguration/drawTraceOfChangeOn',
                                defaultValue: [],
                            }}
                            multiple
                            input={<OutlinedInput label="Send only of type" />}
                            fullWidth>
                            <MenuItem value={'Video'}>Video</MenuItem>
                            <MenuItem value={'Image'}>Image</MenuItem>
                        </SelectConfigurationField>

                        <HelpPopover text="Before sending a notification, we will draw lines describing the movement of whatever was detected" />
                    </Stack>
                </FormControl>
            </Grid>
        </Grid>
    );
}
