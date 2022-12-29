import { DeleteForever } from '@mui/icons-material';
import {
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfiguration } from '../../context/configurationContext';
import eventBus from '../../EventBus';
import { Key, removeLocal } from '../../LocalStore';
import { configurationService } from '../../services/api/Services';
import { TextConfigurationField } from './configurationField';

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

    return (
        <Grid item xs={12} sm={12} md={8}>
            <Grid item xs={12} sm={12} md={4}>
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

            <Grid item xs={12} paddingTop="10px">
                <Button
                    variant="contained"
                    color="warning"
                    startIcon={<DeleteForever />}
                    onClick={() => setShowDeleteConfigurationDialog(true)}>
                    Delete configuration
                </Button>
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
    );
}
