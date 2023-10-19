import { PlayArrowRounded, Square } from '@mui/icons-material';
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    SxProps,
    Theme,
    Zoom,
} from '@mui/material';
import React, { useState } from 'react';
import { Key } from '../../LocalStore';
import DTOObserverStatus from '../../services/api/interfaces/DTOObserverStatus';
import SelectConfiguration from '../SelectConfiguration';
import { useObserverStatus } from '../../context/observerStatusContext';

interface Props {
    onClickStart: (config_id: string) => any;
    onClickStop: () => any;
    sx?: SxProps<Theme>;
}

export default function ToggleRecognizeButton(props: Props) {
    const [selected, setSelected] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const status = useObserverStatus();

    const onConfigurationSelected = (selected: string) => {
        setSelected(selected);
    };

    const onStart = () => {
        if (!selected || selected.length == 0) {
            setError('Select a configuration');
            return;
        }
        props.onClickStart(selected);
    };

    const style = {
        height: 'calc(100% - 45px)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        ...props.sx,
        //border: '1px solid gray',
        width: 'max-content',
    };

    return (
        <Box sx={style}>
            {!status?.running && (
                <Zoom in={!status?.running}>
                    <Button
                        sx={{
                            color: (theme: Theme) => theme.palette.text.primary,
                        }}
                        startIcon={<PlayArrowRounded color="success" />}
                        onClick={onStart}>
                        Start with
                    </Button>
                </Zoom>
            )}

            {status?.running && (
                <Zoom in={status?.running}>
                    <Button
                        sx={{
                            color: (theme: Theme) => theme.palette.text.primary,
                        }}
                        startIcon={<Square color="error" />}
                        onClick={() => props.onClickStop()}>
                        Stop
                    </Button>
                </Zoom>
            )}

            <FormControl>
                <InputLabel id="select-db-configuration">Select</InputLabel>

                <SelectConfiguration
                    labelId="select-db-configuration"
                    label="Configuration"
                    defaultLocalValue={Key.LAST_CONFIGURATION_EXECUTED_ID}
                    onSelected={onConfigurationSelected}
                    selectFirstByDefault={true}
                    disabled={status?.running}
                    forceValue={status?.running ? status?.config_id : undefined}
                    sx={{
                        minWidth: '100px',
                        '& .MuiSelect-select': {
                            padding: '6px 6px 6px 10px',
                        },
                    }}
                />

                <FormHelperText>{error}</FormHelperText>
            </FormControl>
        </Box>
    );
}
