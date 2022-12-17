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

export default function NotificationsTelegramConfiguration(props: any) {
    const { params, updateCB, getFieldCB } = useConfiguration();
    const commonData = { getFieldCB, updateCB };

    return (
        <Grid container spacing={{ xs: 2, md: 1 }}>
            <Grid item xs={12} sm={12} md={12}>
                <FormControlLabel
                    control={
                        <SwitchConfigurationField
                            data={{
                                ...commonData,
                                path: 'telegramConfiguration/enabled',
                            }}
                        />
                    }
                    label="Send notifications to telegram"
                />
            </Grid>

            <Grid item xs={12} sm={12} md={12} sx={{ mb: '5px' }}>
                <Divider light />
                <Typography sx={{ pt: '10px' }}>
                    On how to create a bot check the
                    <Link
                        rel="noreferrer"
                        href="https://core.telegram.org/bots/tutorial#obtain-your-bot-token"
                        underline="none"
                        sx={{ ml: '5px' }}>
                        create a bot and get the token
                    </Link>
                </Typography>
            </Grid>

            <Grid item xs={12} sm={12} md={8} sx={{ mb: '5px' }}>
                <TextConfigurationField
                    label="Telegram api key"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'telegramConfiguration/apiKey',
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4} sx={{ mb: '5px' }}>
                <TextConfigurationField
                    label="Telegram chat id"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData,
                        path: 'telegramConfiguration/chatID',
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
                        path: 'telegramConfiguration/secondsBetweenTextNotification',
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
                        path: 'telegramConfiguration/secondsBetweenImageNotification',
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
                        path: 'telegramConfiguration/secondsBetweenVideoNotification',
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
                            path: 'telegramConfiguration/notificationsToSend',
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
                                path: 'telegramConfiguration/drawTraceOfChangeOn',
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
