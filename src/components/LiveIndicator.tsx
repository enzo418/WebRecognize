import React from 'react';

import '../styles/LiveIndicator.scss';
import { Box } from '@mui/material';

export default function LiveIndicator(
    { size, type }: { size: number; type: 1 | 2 | 3 | 4 } = {
        size: 20,
        type: 4,
    },
) {
    return (
        <Box
            className="live-indicator"
            sx={{
                display: 'flex',
                alignItems: 'center',
                '& > div': {
                    width: size,
                    height: size,
                },
                m: 0,
                p: 0,
            }}>
            <div></div>
            {type > 1 && <div></div>}
            {type > 2 && <div></div>}
            {type > 3 && <div></div>}
        </Box>
    );
}
