import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    SwipeableDrawer,
    Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { configurationService } from '../services/api/Services';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SelectConfiguration from '../components/SelectConfiguration';
import { Key } from '../LocalStore';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import { ContentCopy } from '@mui/icons-material';

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

    const [showDrawer, setShowDrawer] = React.useState(false);

    const toggleDrawer = () => {
        setShowDrawer(!showDrawer);
    };

    return (
        <>
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
                                labelId="select-db-configuration"
                                label="Configuration"
                                onSelected={onChangeConfigurationSelected}
                            />
                        </FormControl>
                    </Stack>
                </Grid>

                <Grid container className="centered" spacing={{ xs: 0, md: 2 }}>
                    <Grid item xs={12} md={1}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={toggleDrawer}>
                            New
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <SwipeableDrawer
                anchor={'bottom'}
                open={showDrawer}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}>
                <Box>
                    <List>
                        <ListItem
                            onClick={() => {
                                toggleDrawer();
                                onNewConfiguration();
                            }}>
                            <ListItemButton>
                                <ListItemIcon>
                                    <AddIcon />
                                </ListItemIcon>
                                <ListItemText primary="New configuration" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            onClick={() => {
                                toggleDrawer();
                                navigate('/configuration_file');
                            }}>
                            <ListItemButton>
                                <ListItemIcon>
                                    <UploadIcon />
                                </ListItemIcon>
                                <ListItemText primary="Upload" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem
                            onClick={() => {
                                toggleDrawer();
                                navigate('/configuration-clone');
                            }}>
                            <ListItemButton>
                                <ListItemIcon>
                                    <ContentCopy />
                                </ListItemIcon>
                                <ListItemText primary="Clone from existing configuration" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </SwipeableDrawer>
        </>
    );
}
