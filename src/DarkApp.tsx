import React from 'react';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function DarkApp() {
    return (
        <ThemeProvider theme={darkTheme}>
            <App />
        </ThemeProvider>
    );
};
