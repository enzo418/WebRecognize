import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';
import './styles/Typography.scss';

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

import React, { useEffect, useMemo, useState } from 'react';

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
import {
    Box,
    createTheme,
    Paper,
    ThemeProvider,
    useMediaQuery,
} from '@mui/material';
import ConfigurationPage from './pages/ConfigurationPage';
import { Stack } from '@mui/system';
import CameraBasics from './components/Configuration/CameraBasics';
import ConfigurationSelection from './pages/ConfigurationSelectionPage';
import CreateConfigurationFromFilePage from './pages/CreateConfigurationFromFilePage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BlobDetectionCameraConfiguration from './components/Configuration/BlobDetectionCameraConfiguration';
import VideoOutputGeneral from './components/Configuration/VideoOutputGeneral';
import DashboardPage from './pages/DashboardPage';
import DetectionCameraConfiguration from './components/Configuration/DetectionCameraConfiguration';
import NotificationsTelegramConfiguration from './components/Configuration/NotificationsTelegramConfiguration';
import NotificationsLocalConfiguration from './components/Configuration/NotificationsLocalConfiguration';
import CloneConfigurationPage from './pages/CloneConfigurationPage';
import AddCamera from './components/Configuration/AddCamera';
import ConfigurationBasics from './components/Configuration/ConfigurationBasics';
import BlobDetectorParametersConfiguration from './components/Configuration/BlobsConfiguration/BlobDetectorParametersConfiguration';
import BlobFiltersConfiguration from './components/Configuration/BlobsConfiguration/BlobFiltersConfiguration';
import BlobContoursFiltersConfiguration from './components/Configuration/BlobsConfiguration/BlobContoursFiltersConfiguration';
import BlobThresholdParametersConfiguration from './components/Configuration/BlobsConfiguration/BlobThresholdParametersConfiguration';
import ApplicationConfiguration from './components/ApplicationConfiguration';
import { getLocalDefault, Key } from './LocalStore';
import eventBus from './EventBus';
import { notificationService, observerService } from './services/api/Services';
import AIValidateEventCameraConfiguration from './components/Configuration/BlobsConfiguration/AIValidateEventCameraConfiguration';
import DTOObserverStatus from './services/api/interfaces/DTOObserverStatus';
import { ObserverStatusContext } from './context/observerStatusContext';
import NotificationsRemoteWebConfiguration from './components/Configuration/NotificationsRemoteWebConfiguration';

function App() {
    const notificationAudioPlayer = React.createRef<HTMLAudioElement>();

    //const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [themeMode, setThemeMode] = useState<'dark' | 'light'>(
        getLocalDefault(Key.THEME_MODE, 'dark') as any,
    );

    const [status, setStatus] = useState<DTOObserverStatus | null>(null);

    const darkTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: themeMode,
                },
            }),
        [themeMode],
    );

    useEffect(() => {
        const playNotificationSound = () => {
            if (notificationAudioPlayer.current)
                notificationAudioPlayer.current.play();
        };

        notificationService.subscribe(playNotificationSound);
        eventBus.on('notification-sound-play', playNotificationSound);

        observerService.onStatusChange(status => {
            setStatus(status);
        });

        return () => {
            notificationService.unsubscribe(playNotificationSound);
            eventBus.remove('notification-sound-play', playNotificationSound);
        };
    });

    eventBus.on('theme-mode-changed', mode => setThemeMode(mode));

    return (
        <ThemeProvider theme={darkTheme}>
            <ObserverStatusContext.Provider value={status}>
                <Router>
                    <Paper elevation={0} sx={{ borderRadius: 0 }}>
                        <Stack direction="row">
                            <NavBar sx={{ maxWidth: '60px' }} />
                            <Box
                                sx={{
                                    width: 'calc(99% - 60px)',
                                    padding: '0px',
                                }}>
                                <Routes>
                                    <Route
                                        path="/notifications"
                                        element={<Notifications />}></Route>
                                    {/*<Route
                                    path="/liveView"
                                    element={<LiveViewPage />}></Route>*/}
                                    <Route
                                        path="/dashboard"
                                        element={<DashboardPage />}></Route>
                                    <Route
                                        path="/application/configuration"
                                        element={
                                            <ApplicationConfiguration />
                                        }></Route>
                                    <Route
                                        path="/configuration"
                                        element={
                                            <ConfigurationSelection />
                                        }></Route>
                                    <Route
                                        path="/configuration_file"
                                        element={
                                            <CreateConfigurationFromFilePage />
                                        }></Route>
                                    <Route
                                        path="/configuration-clone"
                                        element={
                                            <CloneConfigurationPage />
                                        }></Route>
                                    <Route
                                        path="/configuration_file"
                                        element={
                                            <CreateConfigurationFromFilePage />
                                        }></Route>
                                    <Route
                                        path="/configuration/:id"
                                        element={<ConfigurationPage />}>
                                        <Route
                                            path="general"
                                            element={<Outlet />}>
                                            <Route
                                                path="basics"
                                                element={
                                                    <ConfigurationBasics />
                                                }></Route>
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

                                                <Route
                                                    path="remote-web"
                                                    element={
                                                        <NotificationsRemoteWebConfiguration />
                                                    }></Route>
                                            </Route>
                                            <Route
                                                path="add-camera"
                                                element={<AddCamera />}></Route>
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
                                                    element={
                                                        <CameraBasics />
                                                    }></Route>
                                                <Route
                                                    path="detection"
                                                    element={
                                                        //<DetectionCameraConfiguration />
                                                        <DetectionCameraConfiguration />
                                                    }></Route>
                                                {/* <Route path="output" element={<p>camera output</p>}></Route>*/}
                                                <Route
                                                    path="processing"
                                                    element={
                                                        <p>camera processing</p>
                                                    }></Route>
                                                <Route
                                                    path="validation"
                                                    element={<Outlet />}>
                                                    <Route
                                                        path="ai"
                                                        element={
                                                            <AIValidateEventCameraConfiguration />
                                                        }></Route>
                                                    {/*<Route
                                                path="areas"
                                                element={
                                                    <AreasCameraConfiguration />
                                                }></Route>*/}
                                                    <Route
                                                        path="blob"
                                                        element={<Outlet />}>
                                                        <Route
                                                            path="detection"
                                                            element={
                                                                <BlobDetectorParametersConfiguration />
                                                            }></Route>
                                                        <Route
                                                            path="filters"
                                                            element={
                                                                <BlobFiltersConfiguration />
                                                            }></Route>
                                                        {/* maybe merge those two into blobs-basics */}
                                                        <Route
                                                            path="contours-filters"
                                                            element={
                                                                <BlobContoursFiltersConfiguration />
                                                            }></Route>
                                                        <Route
                                                            path="threshold-parameters"
                                                            element={
                                                                <BlobThresholdParametersConfiguration />
                                                            }></Route>
                                                    </Route>
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
                        <NotificationAudio ref={notificationAudioPlayer} />
                    </Paper>
                </Router>
            </ObserverStatusContext.Provider>
        </ThemeProvider>
    );
}

const NotificationAudio = React.forwardRef<HTMLAudioElement, any>(
    (props, ref) => {
        useEffect(() => {
            const onVolumeChanged = (v: number) => {
                const rr =
                    ref as React.MutableRefObject<HTMLAudioElement | null>;
                if (rr && rr.current) rr.current.volume = v;
            };

            onVolumeChanged(
                parseFloat('' + getLocalDefault(Key.NOTIFICATION_VOLUME, 0.3)),
            );

            eventBus.on('notification-sound-volume-changed', onVolumeChanged);

            return () => {
                eventBus.remove(
                    'notification-sound-volume-changed',
                    onVolumeChanged,
                );
            };
        });

        return (
            <audio ref={ref}>
                <source src="/tone1.wav" type="audio/x-wav" />
            </audio>
        );
    },
);

export default App;
