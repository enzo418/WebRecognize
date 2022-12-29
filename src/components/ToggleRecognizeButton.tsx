import { PlayArrowRounded, Square } from '@mui/icons-material';
import { Box, Button, Zoom } from '@mui/material';
import React, { useState } from 'react';
import { Key } from '../LocalStore';
import DTOObserverStatus from '../services/api/interfaces/DTOObserverStatus';
import SelectConfiguration from './SelectConfiguration';

interface Props {
    status: DTOObserverStatus;
    onClickStart: (config_id: string) => any;
    onClickStop: () => any;
}

export default function ToggleRecognizeButton(props: Props) {
    const [selected, setSelected] = useState('');
    const onConfigurationSelected = (selected: string) => {
        setSelected(selected);
    };

    return (
        <Box
            sx={{
                //border: '1px solid gray',
                width: 'max-content',
                padding: '0 10px',
            }}>
            {!props.status.running && (
                <Zoom in={!props.status.running}>
                    <Button
                        sx={{ color: 'CaptionText' }}
                        startIcon={<PlayArrowRounded color="success" />}
                        onClick={() => props.onClickStart(selected)}>
                        Start with
                    </Button>
                </Zoom>
            )}

            {props.status.running && (
                <Zoom in={props.status.running}>
                    <Button
                        sx={{ color: 'CaptionText' }}
                        startIcon={<Square color="error" />}
                        onClick={() => props.onClickStop()}>
                        Stop
                    </Button>
                </Zoom>
            )}

            <SelectConfiguration
                labelId="select-db-configuration"
                label="Configuration"
                defaultLocalValue={Key.LAST_CONFIGURATION_EXECUTED_ID}
                onSelected={onConfigurationSelected}
                selectFirstByDefault={true}
                disabled={props.status.running}
                sx={{
                    minWidth: '100px',
                    '& .MuiSelect-select': {
                        padding: '6px 6px 6px 10px',
                    },
                }}
            />
        </Box>
    );
}
