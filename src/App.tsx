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
    Outlet,
} from 'react-router-dom';

import Notifications from './pages/Notifications';

import './App.scss';
import './styles/Typography.scss';
import { Box, Paper } from '@mui/material';
import LiveViewPage from './pages/LiveViewPage';
import ConfigurationPage from './pages/ConfigurationPage';
import { Stack } from '@mui/system';
import CameraBasics from './components/Configuration/CameraBasics';
import ConfigurationSelection from './pages/ConfigurationSelectionPage';
import CreateConfigurationFromFilePage from './pages/CreateConfigurationFromFilePage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DetectionCameraConfiguration from './components/Configuration/DetectionCameraConfiguration';
import VideoOutputGeneral from './components/Configuration/VideoOutputGeneral';
import DashboardPage from './pages/DashboardPage';
import AreasCameraConfiguration from './components/Configuration/AreasCameraConfiguration';
import NotificationsTelegramConfiguration from './components/Configuration/NotificationsTelegramConfiguration';
import NotificationsLocalConfiguration from './components/Configuration/NotificationsLocalConfiguration';

function App() {
    return (
        <Router>
            <Paper elevation={0}>
                <Stack direction="row">
                    <NavBar sx={{ maxWidth: '60px' }} />
                    <Box sx={{ width: 'calc(99% - 60px)', padding: '0px' }}>
                        <Routes>
                            <Route
                                path="/notifications"
                                element={<Notifications />}></Route>
                            <Route
                                path="/liveView"
                                element={<LiveViewPage />}></Route>
                            <Route
                                path="/dashboard"
                                element={<DashboardPage />}></Route>
                            <Route
                                path="/configuration"
                                element={<ConfigurationSelection />}></Route>
                            <Route
                                path="/configuration_file"
                                element={
                                    <CreateConfigurationFromFilePage />
                                }></Route>
                            <Route
                                path="/configuration/:id"
                                element={<ConfigurationPage />}>
                                <Route path="general" element={<Outlet />}>
                                    <Route
                                        path="basics"
                                        element={<p>basics</p>}></Route>
                                    <Route
                                        path="notifications"
                                        element={<Outlet />}>
                                        <Route
                                            path="telegram"
                                            element={
                                                <NotificationsTelegramConfiguration />
                                            }></Route>

                                        <Route
                                            path="local"
                                            element={
                                                <NotificationsLocalConfiguration />
                                            }></Route>
                                    </Route>
                                    <Route
                                        path="video-output"
                                        element={
                                            <VideoOutputGeneral />
                                        }></Route>
                                    <Route
                                        path="camera/:camera_id"
                                        element={<Outlet />}>
                                        <Route
                                            path="basics"
                                            element={<CameraBasics />}></Route>
                                        <Route
                                            path="detection"
                                            element={
                                                <DetectionCameraConfiguration />
                                            }></Route>
                                        {/* <Route path="output" element={<p>camera output</p>}></Route>*/}
                                        <Route
                                            path="processing"
                                            element={
                                                <p>camera processing</p>
                                            }></Route>
                                        <Route
                                            path="areas"
                                            element={
                                                <AreasCameraConfiguration />
                                            }></Route>
                                        <Route
                                            path="blobs"
                                            element={<Outlet />}>
                                            <Route
                                                path="detection"
                                                element={
                                                    <p>
                                                        camera blobs detection
                                                    </p>
                                                }></Route>
                                            <Route
                                                path="filters"
                                                element={
                                                    <p>camera blobs filters</p>
                                                }></Route>
                                            {/* maybe merge those two into blobs-basics */}
                                            <Route
                                                path="contours-filters"
                                                element={
                                                    <p>
                                                        camera blobs contours
                                                        filters
                                                    </p>
                                                }></Route>
                                        </Route>
                                    </Route>
                                </Route>
                            </Route>
                        </Routes>
                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="dark"
                        />
                    </Box>
                </Stack>
            </Paper>
        </Router>
    );
}

export default App;
