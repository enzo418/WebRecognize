import { MenuItem, Select, SxProps, Theme } from '@mui/material';
import React, { useEffect } from 'react';
import DTOConfigurationDetails from '../services/api/interfaces/DTOConfigurationDetails';
import { configurationService } from '../services/api/Services';

interface SelectConfigurationProps {
    onSelected: (id: string) => any;
    selectFirstByDefault?: boolean;

    sx?: SxProps<Theme>;

    [x: string | number | symbol]: unknown; // indexer, allows extra properties
}

export default function SelectConfiguration(props: SelectConfigurationProps) {
    const [selectedID, setSelectedID] = React.useState<string>('');

    const [availableConfigurations, setAvailableConfigurations] =
        React.useState<DTOConfigurationDetails[]>([]);

    const { onSelected, selectFirstByDefault, ...rest } = props;

    useEffect(() => {
        configurationService
            .getAvailable()
            .ok(cfgs => {
                setAvailableConfigurations(cfgs);

                if (selectFirstByDefault && cfgs.length > 0) {
                    onChangeConfigurationSelected({
                         target: { value: cfgs[0].id },
                    });
                }
            })
            .fail(error => {
                console.error(error);
            });
    }, []);

    const onChangeConfigurationSelected = (ev: any) => {
        const selected = ev?.target?.value as string;
        setSelectedID(selected);
        props.onSelected(selected);
    };

    return (
        <Select
            value={selectedID}
            onChange={onChangeConfigurationSelected}
            {...rest}>
            {availableConfigurations.map(config => (
                <MenuItem key={config.id} value={config.id}>
                    {config.name}
                </MenuItem>
            ))}
        </Select>
    );
}
