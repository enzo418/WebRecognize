import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    Stack,
    Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { configurationService } from '../services/api/Services';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SelectConfiguration from '../components/SelectConfiguration';
import { Key } from '../LocalStore';

export default function ConfigurationSelection() {
    const onNewConfiguration = () => {
        configurationService
            .create()
            .ok(res => navigate(`/configuration/${res.id}/general/basics`))
            .fail(e => console.error("Couldn't create the configuration", e));
    };

    const navigate = useNavigate();

    const onChangeConfigurationSelected = (selected: string) => {
        if (selected.length > 0) {
            navigate(`/configuration/${selected}/general/basics`);
        }
    };

    return (
        <Grid
            container
            sx={{ padding: '10px', height: '100vh' }}
            className="centered"
            spacing={{ xs: 0, md: 2 }}>
            <Grid
                item
                sx={{ padding: '10px 10px 30px 10px' }}
                xs={12}
                className="centered">
                <Stack direction="column">
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{ textAlign: 'center' }}>
                        Select a configuration to open
                    </Typography>
                    <FormControl
                        className="centered"
                        sx={{ width: '100%', minWidth: '30vw' }}>
                        <InputLabel id="select-db-configuration">
                            Select
                        </InputLabel>
                        <SelectConfiguration
                            sx={{ width: '100%' }}
                            defaultLocalValue={Key.LAST_CONFIGURATION_ID}
                            labelId="select-db-configuration"
                            label="Configuration"
                            onSelected={onChangeConfigurationSelected}
                        />
                    </FormControl>
                </Stack>
            </Grid>

            <Grid container className="centered" spacing={{ xs: 0, md: 2 }}>
                <Grid item xs={12} md={1}>
                    <Typography variant="subtitle1" color="GrayText">
                        ADD
                    </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        fullWidth
                        to="/configuration_file">
                        From file
                    </Button>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        sx={{ textAlign: 'center' }}
                        fullWidth
                        to="/configuration-clone">
                        Clone from existing configuration
                    </Button>
                </Grid>

                <Grid item xs={12} md={1}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onNewConfiguration}>
                        New
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    );
}
