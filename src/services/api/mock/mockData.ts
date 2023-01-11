import { addSeconds, addHours } from 'date-fns';
import { ENotificationType } from '../../../domain/Notification';
import { getEnumAt, getEnumKeysNames } from '../../../utils/enum';
import { random } from '../../../utils/random';
import DTOCamera, { DTOCameraDefaults } from '../interfaces/DTOCamera';
import DTONotification from '../interfaces/DTONotification';

/* ----------------------- IMAGES ----------------------- */
export const getRandomImage = (start: number) =>
    `https://picsum.photos/640/360?random=1&cache=${random(start, 100000)}`;

/* ----------------------- VIDEOS ----------------------- */
export const videos: string[] = [
    'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-20s.mp4',
    'https://samplelib.com/lib/preview/mp4/sample-30s.mp4',
];

export const getRandomVideo = (start: number) =>
    videos[random(start, 100) % videos.length];

/* ----------------------- CAMERAS ---------------------- */
const generateCameras = (n: number) => {
    const generated: DTOCamera[] = [];

    for (let i = 0; i < n; i++) {
        generated.push({
            id: '' + i,
            name: 'cam' + i,
            url: '' + i,
        });
    }

    return generated;
};

const woodsCam: DTOCamera[] = [
    { id: '3508530276647043968', name: 'Woods', url: '' },
];

const generatedCameras = generateCameras(500);
const generateCamerasUrl = generatedCameras.reduce((ac, curr, i) => {
    (ac as any)[curr.id] = getRandomImage(i);
    return ac;
}, {});

export const camerasMock: DTOCamera[] = [...generatedCameras, ...woodsCam];

export const cameraToImageUrl = {
    ...generateCamerasUrl,
    '3508530276647043968': process.env.PUBLIC_URL + '/mock/woods.png',
};

// camera defaults
export const cameraDefaults: DTOCameraDefaults = {
    fps: 30,
    size: {
        width: 1280,
        height: 720,
    },
};

/* -------------------- NOTIFICATIONS ------------------- */
const generateNotifications = (n: number, numberCams: number) => {
    const generated: DTONotification[] = [];
    // let lastID:number = -1;
    let lastDate: Date = new Date();

    const types = getEnumKeysNames(ENotificationType);

    let lastNID = -1;
    for (let i = 0; i < n; i++) {
        const camera = camerasMock[random(0, camerasMock.length - 1)];

        types.forEach((t, ti) => {
            let content: string = '';

            switch (getEnumAt(ENotificationType, t)) {
                case ENotificationType.IMAGE:
                    content = getRandomImage(i);
                    break;
                case ENotificationType.VIDEO:
                    content = getRandomVideo(i);
                    break;
                case ENotificationType.TEXT:
                    content =
                        'random text with lucky number: ' + random(0, 999);
                    break;
            }

            const newDate = addSeconds(lastDate, random(0, 15 * 60));

            const g: DTONotification = {
                id: '' + (lastNID + ti + 1),
                groupID: i,
                camera: camera,
                datetime: Math.floor(newDate.getTime() / 1000),
                type: t,
                content,
                configurationID: '1',
            };

            if (random(0, 10) > 3) {
                generated.push(g);
                lastNID = parseInt(g.id);
            }

            lastDate = addHours(newDate, random(1, 1));
        });
    }

    return generated;
};

export const extraNotifications: DTONotification[] = [
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/videos/3508532183818052992.mp4',
        datetime: 1672955315,
        groupID: 38,
        id: '3508532183818052992',
        type: 'video',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '',
        datetime: 1672955313,
        groupID: 38,
        id: '3508532179260941184',
        type: 'text',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/images/3508532179416130688.jpg',
        datetime: 1672955313,
        groupID: 38,
        id: '3508532179416130688',
        type: 'image',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/videos/3508539548099414784.mp4',
        datetime: 1672958827,
        groupID: 68,
        id: '3508539548099414784',
        type: 'video',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '',
        datetime: 1672958826,
        groupID: 68,
        id: '3508539544924326144',
        type: 'text',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/images/3508539544980949504.jpg',
        datetime: 1672958826,
        groupID: 68,
        id: '3508539544980949504',
        type: 'image',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/videos/3508540201555202944.mp4',
        datetime: 1672959139,
        groupID: 71,
        id: '3508540201555202944',
        type: 'video',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '',
        datetime: 1672959129,
        groupID: 71,
        id: '3508540180579488128',
        type: 'text',
    },
    {
        camera: { id: '3508530276647043968', name: 'Woods' },
        configurationID: '3508530237822468224',
        content: '/mock/images/3508540180768232064.jpg',
        datetime: 1672959129,
        groupID: 71,
        id: '3508540180768232064',
        type: 'image',
    },
];

export const mapGroupToBuffer = {
    38: '3508532210502215296',
    48: '3508532703236475904',
    63: '3508535866488258816',
    64: '3508535813914755200',
    65: '3508538787164588032',
    68: '3508539953634087040',
    71: '3508540763283657856',
};

export const notificationsMock: DTONotification[] = [
    ...extraNotifications,
    //...generateNotifications(1000, 450),
];

/* -------------------- VIDEO BUFFER -------------------- */
export const mapVBIDtoFile = {
    '3508532210502215296': {
        raw: '/mock/videos/38_buffer.gif',
        diff: null,
    },
    '3508532703236475904': {
        raw: '/mock/videos/48_buffer.gif',
        diff: '/mock/videos/3508532703236475904_buffer_diff.tiff',
    },
    '3508535866488258816': {
        raw: '/mock/videos/63_buffer.gif',
        diff: '/mock/videos/3508535866488258816_buffer_diff.tiff',
    },
    '3508535813914755200': {
        raw: '/mock/videos/64_buffer.gif',
        diff: null,
    },
    '3508538787164588032': {
        raw: '/mock/videos/65_buffer.gif',
        diff: '/mock/videos/3508538787164588032_buffer_diff.tiff',
    },
    '3508539953634087040': {
        raw: '/mock/videos/68_buffer.gif',
        diff: '/mock/videos/3508539953634087040_buffer_diff.tiff',
    },
    '3508540763283657856': {
        raw: '/mock/videos/71_buffer.gif',
        diff: '/mock/videos/3508540763283657856_buffer_diff.tiff',
    },
};

export const videoBufferDTOs =
    process.env.PUBLIC_URL + '/mock/videoBufferWoods.json';

/* ----------------- MOCK CONFIGURATION ----------------- */
export const configurations = [
    {
        id: '3508530237822468224',
        name: 'Sample',
        telegramConfiguration: {
            enabled: false,
            apiKey: '',
            chatID: '',
            drawTraceOfChangeOn: [],
            notificationsToSend: ['Text', 'Image', 'Video'],
            secondsBetweenTextNotification: 15,
            secondsBetweenImageNotification: 15,
            secondsBetweenVideoNotification: 15,
        },
        localWebConfiguration: {
            enabled: true,
            webServerUrl: 'localhost:3001',
            secondsBetweenTextNotification: 15,
            secondsBetweenImageNotification: 15,
            secondsBetweenVideoNotification: 15,
            notificationsToSend: ['Text', 'Image', 'Video'],
            drawTraceOfChangeOn: ['Video', 'Image'],
        },
        outputConfiguration: {
            showOutput: true,
            resolution: { width: 640, height: 360 },
        },
        cameras: {
            '3508530276647043968': {
                name: 'Woods',
                url: 'rtmp://127.0.0.1/live/test',
                type: 'Notificator',
                rotation: 0,
                resizeTo: { height: 360, width: 640 },
                videoValidatorBufferSize: 180,
                minimumChangeThreshold: 100,
                increaseThresholdFactor: 1.2,
                processingConfiguration: {
                    resize: { width: 640, height: 360 },
                    noiseThreshold: 45,
                    roi: { height: 0, width: 0, x: 450, y: 320 },
                    masks: [
                        [
                            { x: 930.2051389313469, y: 21.75824175824176 },
                            { x: 927.2395540038294, y: 58.35164835164835 },
                            { x: 1248.5112544849003, y: 55.38461538461539 },
                            { x: 1247.5227261757277, y: 15.824175824175825 },
                            { x: 930.2051389313469, y: 21.75824175824176 },
                        ],
                        [
                            { x: 1.977056618345052, y: 0.989010989010989 },
                            { x: 1.977056618345052, y: 83.07692307692308 },
                            { x: 665.27955207311, y: 90 },
                            { x: 839.2605344874746, y: 23.736263736263737 },
                            { x: 850.1343458883723, y: 3.956043956043956 },
                            { x: 1.977056618345052, y: 0.989010989010989 },
                        ],
                    ],
                },
                blobDetection: {
                    blobDetectorParams: {
                        distance_thresh: 92,
                        similarity_threshold: 0.6,
                        blob_max_life: 35,
                    },
                    blobFilters: {
                        MinimumOccurrences: 27,
                        MinimumUnitsTraveled: 0,
                    },
                    contoursFilters: {
                        MinimumArea: 40,
                        FilterByAverageArea: true,
                        ignoredSets: {
                            reference: { height: 360, width: 640 },
                            minPercentageToIgnore: 85,
                            sets: [
                                [
                                    {
                                        x: 432.4811352629801,
                                        y: 7.417582417582418,
                                    },
                                    {
                                        x: 419.6302672437373,
                                        y: 108.79120879120879,
                                    },
                                    {
                                        x: 525.4027963251975,
                                        y: 130.54945054945057,
                                    },
                                    {
                                        x: 615.8531366144837,
                                        y: 139.45054945054946,
                                    },
                                    {
                                        x: 633.6466461795892,
                                        y: 137.47252747252747,
                                    },
                                    { x: 638.5892877254518, y: 0 },
                                    {
                                        x: 432.4811352629801,
                                        y: 7.417582417582418,
                                    },
                                ],
                                [
                                    {
                                        x: 1.482792463758789,
                                        y: 0.989010989010989,
                                    },
                                    {
                                        x: 0.494264154586263,
                                        y: 120.16483516483517,
                                    },
                                    {
                                        x: 35.09275497562467,
                                        y: 133.51648351648353,
                                    },
                                    {
                                        x: 65.73713255997298,
                                        y: 135.989010989011,
                                    },
                                    {
                                        x: 100.82988753559765,
                                        y: 106.31868131868133,
                                    },
                                    {
                                        x: 109.23237816356412,
                                        y: 74.17582417582418,
                                    },
                                    {
                                        x: 100.33562338101139,
                                        y: 47.472527472527474,
                                    },
                                    {
                                        x: 136.91117082039486,
                                        y: 44.010989010989015,
                                    },
                                    {
                                        x: 134.43985004746352,
                                        y: 55.38461538461539,
                                    },
                                    {
                                        x: 162.11864270429427,
                                        y: 63.791208791208796,
                                    },
                                    {
                                        x: 174.47524656895084,
                                        y: 79.61538461538461,
                                    },
                                    {
                                        x: 209.5680015445755,
                                        y: 99.8901098901099,
                                    },
                                    {
                                        x: 241.6951715926826,
                                        y: 99.3956043956044,
                                    },
                                    {
                                        x: 277.2821907228935,
                                        y: 90.4945054945055,
                                    },
                                    {
                                        x: 303.47819091596546,
                                        y: 72.1978021978022,
                                    },
                                    {
                                        x: 354.8816629929368,
                                        y: 74.17582417582418,
                                    },
                                    {
                                        x: 426.54996540794497,
                                        y: 58.35164835164835,
                                    },
                                    { x: 436.43524849967025, y: 0 },
                                    {
                                        x: 1.482792463758789,
                                        y: 0.989010989010989,
                                    },
                                ],
                            ],
                        },
                    },
                    thresholdParams: {
                        FramesBetweenDiffFrames: 3,
                        ContextFrames: 4,
                        MedianBlurKernelSize: 3,
                        GaussianBlurKernelSize: 7,
                        DilationSize: 2,
                        BrightnessAboveThreshold: 4,
                    },
                },
            },
        },
    },
];
