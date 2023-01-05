import { Box, Theme } from '@mui/material';
import React, { Component, ReactElement } from 'react';

export default function InfoCard(props: any) {
    return (
        <Box
            sx={{
                backgroundColor: (theme: Theme) => theme.palette.grey[900],
                padding: '5px',
                color: '#fff',
                borderLeft: '5px solid #000',
                borderColor: 'info.main',
            }}>
            {props.children}
        </Box>
    );
}
