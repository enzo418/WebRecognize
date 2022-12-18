import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import DTOConfigurationDetails from '../services/api/interfaces/DTOConfigurationDetails';
import { configurationService } from '../services/api/Services';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SelectConfiguration from '../components/SelectConfiguration';
import { toast } from 'react-toastify';

export default function ConfigurationSelection() {
    const navigate = useNavigate();

    const onChangeConfigurationSelected = (selected: string) => {
        if (selected.length > 0) {
            configurationService
                .clone(selected)
                .ok(({ id }) => {
                    navigate(`/configuration/${id}/general/basics`);
                })
                .fail(e => {
                    toast.error(
                        'Could not clone the configuration, got: ' + e.title,
                    );
                });
        }
    };

    return (
        <Box sx={{ padding: '10px' }} className="centered">
            <Box className="centered" sx={{ height: '100vh', gap: '20vh' }}>
                <Box className="centered">
                    <Typography variant="h5" gutterBottom>
                        Select the configuration to clone
                    </Typography>
                    <FormControl
                        sx={{ width: 'fit-content', minWidth: '30vw' }}>
                        <InputLabel id="select-db-configuration">
                            Select
                        </InputLabel>
                        <SelectConfiguration
                            labelId="select-db-configuration"
                            label="Configuration"
                            onSelected={onChangeConfigurationSelected}
                        />
                    </FormControl>
                </Box>
            </Box>
        </Box>
    );
}
