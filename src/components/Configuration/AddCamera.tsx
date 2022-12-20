import {
    Box,
    Button,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useConfiguration } from '../../context/configurationContext';
import DTOCamera from '../../services/api/interfaces/DTOCamera';
import { configurationService } from '../../services/api/Services';

export default function AddCamera() {
    const { params } = useConfiguration();
    const configID = params.id;

    const [selectedCamera, setSelectedCamera] = useState<string>('');
    const [cameras, setCameras] = useState<DTOCamera[]>();

    useEffect(() => {
        // TODO: We should get all the cameras from all the configurations
        configurationService
            .getConfigurationCameras(configID)
            .ok(cameras => {
                setCameras(cameras);
            })
            .fail(e =>
                console.error(
                    "couldn't get the cameras from the configuration",
                    e,
                ),
            );
    }, [configID]);

    const navigate = useNavigate();

    const newFromScratch = () => {
        configurationService
            .createCamera(configID)
            .ok(({ id }) => {
                navigate(
                    `/configuration/${configID}/general/camera/${id}/basics`,
                );
            })
            .fail(e => {
                console.log(e);
                toast.error('Could not create the camera: ' + e.title);
            });
    };

    const newFromClone = (cloneID: string) => {
        configurationService
            .createCamera(configID, cloneID)
            .ok(({ id }) => {
                navigate(
                    `/configuration/${configID}/general/camera/${id}/basics`,
                );
            })
            .fail(e => {
                console.log(e);
                toast.error('Could not clone the camera: ' + e.title);
            });
    };

    return (
        <Box>
            <Stack direction="column">
                <Box sx={{ padding: '10px' }} className="centered">
                    <Button variant="outlined" onClick={newFromScratch}>
                        CREATE NEW FROM SCRATCH
                    </Button>
                </Box>

                <Divider></Divider>

                <Typography sx={{ mt: '5px' }}>
                    or clone an existing camera
                </Typography>

                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <InputLabel id="select-camera-clone">
                        Select a camera to clone
                    </InputLabel>
                    <Select
                        labelId="select-camera-clone"
                        value={selectedCamera}
                        label="Select a camera to clone"
                        onChange={({ target }) => newFromClone(target.value)}
                        fullWidth>
                        {cameras?.map(cam => (
                            <MenuItem key={cam.id} value={cam.id}>
                                {cam.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider light></Divider>

                <Box sx={{ padding: '10px' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate(-1)}>
                        CANCEL
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
