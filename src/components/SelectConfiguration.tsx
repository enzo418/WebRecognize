import { MenuItem, Select, SxProps, Theme } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { getLocal, Key } from '../LocalStore';
import DTOConfigurationDetails from '../services/api/interfaces/DTOConfigurationDetails';
import { configurationService } from '../services/api/Services';

interface SelectConfigurationProps {
    onSelected: (id: string) => any;
    selectFirstByDefault?: boolean;

    defaultLocalValue?: Key;

    sx?: SxProps<Theme>;

    forceValue?: string;

    [x: string | number | symbol]: unknown; // indexer, allows extra properties
}

export default function SelectConfiguration(props: SelectConfigurationProps) {
    const [selectedID, setSelectedID] = React.useState<string>('');

    const [availableConfigurations, setAvailableConfigurations] =
        React.useState<DTOConfigurationDetails[]>([]);

    const {
        onSelected,
        selectFirstByDefault,
        defaultLocalValue,
        forceValue,
        ...rest
    } = props;

    const onChangeConfigurationSelected = useCallback(
        (ev: any) => {
            const selected = ev?.target?.value as string;
            setSelectedID(selected);
            props.onSelected(selected);
        },
        [props],
    );

    const getLastCfgUsed = () => {
        if (!defaultLocalValue) return null;

        // if you delete a configuration it triggers the event bus,
        // which in some part will delete the local cfg stored

        return getLocal(defaultLocalValue);
    };

    useEffect(() => {
        configurationService
            .getAvailable()
            .ok(cfgs => {
                setAvailableConfigurations(cfgs);

                const lastCfg = getLastCfgUsed();

                if (!lastCfg && selectFirstByDefault && cfgs.length > 0) {
                    onChangeConfigurationSelected({
                        target: { value: cfgs[0].id },
                    });
                } else if (lastCfg && selectFirstByDefault) {
                    onChangeConfigurationSelected({
                        target: { value: lastCfg },
                    });
                } else if (lastCfg) {
                    setSelectedID(lastCfg);
                }
            })
            .fail(error => {
                console.error(error);
            });
    }, []);

    return (
        <Select
            value={props.forceValue ? props.forceValue : selectedID}
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
