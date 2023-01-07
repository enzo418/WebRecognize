const port = window.location.port; // real: 3001
const host = window.location.hostname;
const location = `http://${host}:${port}`;

const config = {
    server: location,
    endpoints: {
        api: {
            notification: '/api/notifications',
            liveViewObserver: '/api/requestObserverStream',
            liveViewCamera: '/api/requestCameraStream',
            streamBuffer: '/stream/buffer/',
        },
        websocket: {
            notification: `ws://${host}:${port}/notifications`,
            liveView: `ws://${host}:${port}/live/`, // ws:/live/liveID
            videoBuffer: `ws://${host}:${port}/buffer/`, // ws:/buffer/bufferID
        },
    },
};

export default config;
