import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import React from 'react';


import Grid from '@mui/material/Grid';
import Item from '@mui/material/Grid';

import NavBar from './NavBar';

import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';

import Notifications from './pages/Notifications';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';


import './App.scss';
import './styles/Typography.scss';
import {Paper} from '@mui/material';

function App() {
    return (

        <Router>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Paper elevation={0} >
                    <Grid container spacing={2}>
                        <Grid item xs={2} md={1}>
                            <Item><NavBar></NavBar></Item>
                        </Grid>
                        <Grid item xs={10} md={11} >
                            <Routes>
                                <Route path="/notifications" element={<Notifications />}>
                                </Route>
                            </Routes>
                        </Grid>
                    </Grid>
                </Paper>
            </LocalizationProvider>

        </Router>
    );
}

export default App;
