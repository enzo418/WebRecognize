const port = 3001; // mock: window.location.port
const host = window.location.hostname;
const location = `http://${host}:${port}`;

const config = {
    server: location,
    endpoints: {
        api: {
            notification: '/api/notifications',
            liveViewObserver: '/api/requestObserverStream',
            liveViewCamera: '/api/requestCameraStream',
            streamBuffer: '/stream/buffer/', // tf?
            stream: {
                camera: '/api/stream/camera/',
                observer: '/api/stream/observer',
                uri: '/api/stream/source/',
            },
        },
        websocket: {
            observerStatus: `ws://${host}:${port}/observer/status`,
            notification: `ws://${host}:${port}/notifications`,
            liveView: `ws://${host}:${port}/live/`, // ws:/live/liveID
            videoBuffer: `ws://${host}:${port}/buffer/`, // ws:/buffer/bufferID
        },
    },
};

export default config;
