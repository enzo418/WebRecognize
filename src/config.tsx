const port = 3001;
const host = window.location.hostname;
const location = `http://${host}:${port}`;

const config = {
    server: location,
    endpoints: {
        api: {
            notification: '/api/notifications',
        },
        websocket: {
            notification: `ws://${host}:${port}/notifications`,
        },
    },
};

export default config;
