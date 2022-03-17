const location = `${window.location.hostname}:${window.location.port}`;
const config = {
    server: '',
    endpoints: {
        api: {
            notification: '/api/notifications',
        },
        websocket: {
            notification: `ws://${location}/notification`,
        },
    },
};

export default config;
