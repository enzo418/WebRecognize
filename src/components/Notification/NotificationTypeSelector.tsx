import { Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import React from 'react';

import Notification from '../../domain/Notification';

interface INotificationTypeSelectorProps {
    type: string;
    onChange: (t: string) => void;
    allTypes: string[];
    selectableTypes: string[];
    isSmallScreen: boolean;
}

export default function NotificationTypeSelector(
    props: INotificationTypeSelectorProps,
) {
    const { type, onChange, allTypes, selectableTypes } = props;

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newType: string,
    ) => {
        onChange(newType);
    };

    return (
        <>
            <Typography className="grey-title">Show</Typography>
            <ToggleButtonGroup
                orientation={props.isSmallScreen ? 'horizontal' : 'vertical'}
                value={type}
                exclusive
                onChange={handleChange}
                sx={{ width: '90%' }}>
                {allTypes.map(t => (
                    <ToggleButton
                        key={t}
                        value={t}
                        aria-label={t}
                        disabled={selectableTypes.indexOf(t) == -1}
                        sx={{ width: '100%' }}>
                        <Typography>{t}</Typography>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </>
    );
}
