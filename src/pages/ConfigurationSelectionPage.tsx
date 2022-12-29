import {
    Box,
    Button,
    FormControl,
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
            .ok(res => navigate(res.id))
            .fail(e => console.error("Couldn't create the configuration", e));
    };

    const navigate = useNavigate();

    const onChangeConfigurationSelected = (selected: string) => {
        if (selected.length > 0) {
            navigate(`/configuration/${selected}/general/basics`);
        }
    };

    return (
        <Box sx={{ padding: '10px' }} className="centered">
            <Box className="centered" sx={{ height: '100vh', gap: '20vh' }}>
                <Box className="centered">
                    <Typography variant="h5" gutterBottom>
                        Select a configuration to open
                    </Typography>
                    <FormControl
                        sx={{ width: 'fit-content', minWidth: '30vw' }}>
                        <InputLabel id="select-db-configuration">
                            Select
                        </InputLabel>
                        <SelectConfiguration
                            defaultLocalValue={Key.LAST_CONFIGURATION_ID}
                            labelId="select-db-configuration"
                            label="Configuration"
                            onSelected={onChangeConfigurationSelected}
                        />
                    </FormControl>
                </Box>

                <Box sx={{ padding: '10px' }} className="centered">
                    <Stack direction="row" spacing={4} alignItems={'center'}>
                        <Typography variant="subtitle1" color="GrayText">
                            ADD
                        </Typography>
                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to="/configuration_file">
                            From file
                        </Button>
                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to="/configuration-clone">
                            Clone from existing configuration
                        </Button>
                        <Button variant="outlined" onClick={onNewConfiguration}>
                            New
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
