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

import './App.scss';
import './styles/Typography.scss';
import {Paper} from '@mui/material';
import LiveViewPage from './pages/LiveViewPage';

function App() {
    return (
        <Router>
            <Paper elevation={0} >
                <Stack direction="row">
                    <NavBar sx={{maxWidth: '60px'}} />
                    <Box sx={{width: 'calc(100% - 60px)', padding: '0px'}}>
                        <Routes>
                            <Route path="/notifications" element={<Notifications />}>
                            </Route>
                            <Route path="/liveView" element={<LiveViewPage />}>
                            </Route>
                        </Routes>
                    </Grid>
                </Grid>
            </Paper>
        </Router>
    );
}

export default App;
