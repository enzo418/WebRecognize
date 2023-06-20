import { DeleteForever } from '@mui/icons-material';
import {
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    Stack,
    Box,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfiguration } from '../../context/configurationContext';
import eventBus from '../../EventBus';
import { Key, removeLocal } from '../../LocalStore';
import { configurationService } from '../../services/api/Services';
import { TextConfigurationField } from './configurationField';
import downloadFromText from '../../utils/file';
import IProblemJson from '../../services/api/interfaces/IProblemJson';
import DownloadIcon from '@mui/icons-material/Download';

export default function ConfigurationBasics() {
    const { params, updateCB, getFieldCB, getInitialValue } =
        useConfiguration();

    const commonData = { updateCB, getFieldCB, getInitialValue };

    const [showDeleteConfigurationDialog, setShowDeleteConfigurationDialog] =
        useState<boolean>(false);

    const handleCloseDeleteDialog = () =>
        setShowDeleteConfigurationDialog(false);

    const navigate = useNavigate();

    const handleAcceptDeleteDialog = () => {
        configurationService
            .deleteConfiguration(params.id)
            .ok(() => {
                eventBus.dispatch('removed-configuration', { id: params.id });
                handleCloseDeleteDialog();
                navigate(`/configuration/`);
            })
            .fail(e => console.error("Couldn't delete the camera: ", e));
    };

    const exportConfigurationToFile = () => {
        configurationService
            .exportConfiguration(params.id)
            .ok(response => {
                getFieldCB('name')
                    .ok(name => {
                        const filename =
                            'configuration_' +
                            name +
                            '_' +
                            new Date()
                                .toLocaleDateString()
                                .replaceAll('/', '_') +
                            '.json';
                        if (typeof response === 'string') {
                            downloadFromText(filename, response);
                        } else {
                            downloadFromText(
                                filename,
                                JSON.stringify(response),
                            );
                        }
                    })
                    .catch(() => {
                        const filename = 'configuration_' + params.id + '.json';

                        if (typeof response === 'string') {
                            downloadFromText(filename, response);
                        } else {
                            downloadFromText(
                                filename,
                                JSON.stringify(response),
                            );
                        }
                    });
            })
            .catch((e: IProblemJson) =>
                console.error("Couldn't export the configuration: ", e.title, {
                    error: e,
                }),
            );
    };

    return (
        <Stack
            direction="column"
            justifyContent={'space-between'}
            height={'100%'}>
            <Grid item xs={12}>
                <Grid item xs={11}>
                    <TextConfigurationField
                        label="name"
                        variant="standard"
                        fullWidth
                        data={{
                            ...commonData,
                            path: 'name',
                        }}
                    />
                </Grid>

                <Dialog
                    open={showDeleteConfigurationDialog}
                    onClose={handleCloseDeleteDialog}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description">
                    <DialogTitle id="delete-dialog-title">
                        {'Delete configuration?'}
                    </DialogTitle>
                    {/*<DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        It will be deleted forever
                    </DialogContentText>
                    </DialogContent>*/}
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} autoFocus>
                            Cancel
                        </Button>
                        <Button onClick={handleAcceptDeleteDialog}>YES</Button>
                    </DialogActions>
                </Dialog>
            </Grid>

            <Stack
                direction="row"
                justifyContent={'space-around'}
                sx={{
                    position: 'sticky',
                    bottom: 0,
                }}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportConfigurationToFile}>
                    Export
                </Button>

                <Button
                    variant="contained"
                    color="warning"
                    startIcon={<DeleteForever />}
                    onClick={() => setShowDeleteConfigurationDialog(true)}>
                    Delete configuration
                </Button>
            </Stack>
        </Stack>
    );
}
