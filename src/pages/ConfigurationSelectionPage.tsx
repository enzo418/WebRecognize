import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography} from '@mui/material';
import React, {useEffect} from 'react';
import DTOConfigurationDetails from '../services/api/interfaces/DTOConfigurationDetails';
import {configurationService} from '../services/api/Services';
import { 
    Link as RouterLink,
    useNavigate } from 'react-router-dom';

interface ConfigurationSelectionPageProps {};

export default function ConfigurationSelection(props: ConfigurationSelectionPageProps){
    const [selectedID, setSelectedID] = React.useState<string>("");
    
    const [
        availableConfigurations, 
        setAvailableConfigurations
    ] = React.useState<DTOConfigurationDetails[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        configurationService.getAvailable()
            .ok((cfgs) => {
                setAvailableConfigurations(cfgs);
            })
            .fail((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        if (selectedID.length > 0){
            navigate(`/configuration/${selectedID}/general`); 
        }
    }, [selectedID]);

    const onNewConfiguration = () => {
        configurationService.create()
            .ok(res => navigate(res.id))
            .fail(e => console.error("Couldn't create the configuration", e));
    }

    const onChangeConfigurationSelected = (ev:any) => {
        setSelectedID(ev?.target?.value as string);
    }

    return(<Box sx={{padding: '10px'}} className='centered'>
        <Box
            className='centered'
            sx={{'height': '100vh', 'gap': '20vh'}}
        >
            <Box className='centered'>
                <Typography variant="h5" gutterBottom>
            Select a configuration to open
                </Typography>
                <FormControl sx={{width: 'fit-content', minWidth: '30vw'}}>
                    <InputLabel id="select-db-configuration">Select</InputLabel>
                    <Select
                        labelId="select-db-configuration"
                        value={selectedID}
                        label="Configuration"
                        onChange={onChangeConfigurationSelected}
                    >
                        {
                            availableConfigurations.map((config) => (
                                <MenuItem key={config.id} value={config.id}>{config.name}</MenuItem>)
                            )
                        }
                        
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{padding: '10px'}} className='centered'>
                <Stack direction="row" spacing={4}>
                    <Button variant="outlined" component={RouterLink} to="/configuration_file" >From file</Button>
                    <Button variant="outlined" onClick={onNewConfiguration}>New</Button>
                </Stack>
            </Box>
        </Box>
    </Box>);
}
