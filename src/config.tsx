const location = `http://localhost:3001`;

const config = {
    server: location,
    endpoints: {
        api: {
            notification: '/api/notifications',
        },
        websocket: {
            notification: `ws://localhost:3001/notifications`,
        },
    },
};

export default config;
