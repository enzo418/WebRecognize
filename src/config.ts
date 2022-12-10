const port = 3001;
const host = window.location.hostname;
const location = `http://${host}:${port}`;

const config = {
    server: location,
    endpoints: {
        api: {
            notification: '/api/notifications',
            liveViewObserver: '/api/requestObserverStream',
            liveViewCamera: '/api/requestCameraStream',
            cameraDefaults: '/api/getCameraDefaults',
            cameraFrame: '/api/getCameraFrame'
        },
        websocket: {
            notification: `ws://${host}:${port}/notifications`,
            liveView: `ws://${host}:${port}/live/`, // ws:/live/liveID
        },
    },
};

export default config;
