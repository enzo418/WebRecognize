import {
    Delete,
    Pause,
    PlayArrow,
    Replay,
    SkipNext,
    SkipPrevious,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    ButtonGroup,
    Button,
    Grid,
    IconButton,
    Divider,
    Typography,
    LinearProgress,
    Skeleton,
} from '@mui/material';
import { Stack } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import config from '../config';
import { Size } from '../Geometry';
import { Key, removeLocal, saveLocal, saveLocalObject } from '../LocalStore';
import CanvasHandlerBufferPlayer from '../modules/CanvasHandlerBufferPlayer';
import DTOVideoBuffer from '../services/api/interfaces/DTOVideoBuffer';
import { videoBufferService } from '../services/api/Services';
import { VideoBufferWebSocket } from '../services/api/VideoBufferService';
import { ensure } from '../utils/error';
import MultiTiffImageProvider from '../services/images/MultiImageProvider';

enum RoomView {
    NONE = 0,
    RAW = 1 << 0,
    DIFF = 1 << 1,
    CONTOURS = 1 << 2,
    BLOBS = 1 << 3,
    ALL = 0b1111,
}

interface ProcessingRoomProps {
    bufferID: string;
    onDelete: () => any;
}

const buttons = [
    { title: 'Camera Frame', e: RoomView.RAW },
    { title: 'Diff Frame', e: RoomView.DIFF },
    { title: 'Contours', e: RoomView.CONTOURS },
    { title: 'Blobs', e: RoomView.BLOBS },
];

const enable_buttons_map = {
    without_buffer: RoomView.NONE,
    with_buffer: RoomView.RAW,
    detected: RoomView.ALL,
};

const has_flag = (flags: number, flag: number) => (flags & flag) == flag;

/**
 * This component receives a buffer id, which might be a newly created
 * buffer that it's still processing or it might already has the frames
 * or, even better it has even the contours and blobs
 * That is why we need to make a connection to the buffer WS as fast as we can
 * so we know the current state
 */
export default function ProcessingRoom(props: ProcessingRoomProps) {
    const canvasPlayer = React.createRef<CanvasHandlerBufferPlayer>();
    const containerRef = React.createRef<HTMLDivElement>();

    const [buffer, setBuffer] = useState<DTOVideoBuffer>();
    const [showViews, setViews] = useState<RoomView>(RoomView.ALL);
    const [playing, setPlaying] = useState<boolean>(false);
    const [canvasSize, setCanvasSize] = useState<Size>({ width: 0, height: 0 });
    const [runningDetection, setRunningDetection] = useState<boolean>(false);

    const cameraImages = useMemo(() => new MultiTiffImageProvider(), []);
    const diffImages = useMemo(() => new MultiTiffImageProvider(), []);

    const wsBuffer = useMemo(
        () => new VideoBufferWebSocket(props.bufferID),
        [props.bufferID],
    );

    const toggleView = (e: RoomView) => {
        if (has_flag(showViews, e)) {
            // remove view
            setViews(showViews & ~e);
        } else {
            // add view
            setViews(showViews | e);
        }
    };

    const getCameraFrames = () => {
        const url = videoBufferService.getStreamBufferUrl(
            props.bufferID,
            'raw',
        );

        if (cameraImages.getLastSuccessfulFetchUrl() == url) return;

        if (cameraImages.fetched()) {
            cameraImages.freeImages();
        }

        cameraImages.fetchImagesAsImageData(url);
    };

    const getDiffFrames = () => {
        if (diffImages.fetched()) {
            diffImages.freeImages();
        }

        diffImages.fetchImagesAsImageData(
            videoBufferService.getStreamBufferUrl(props.bufferID, 'diff'),
        );
    };

    useEffect(() => {
        // resize canvas so it fits in the screen
        if (containerRef.current) {
            const bounds = containerRef.current.getBoundingClientRect();

            setCanvasSize({
                width: bounds.width,
                height: bounds.width / (16 / 9),
            });
        }

        wsBuffer.onOpen(() => {
            console.debug('Websocket buffer opened');
        });

        wsBuffer.onClose(() => {
            console.debug('Websocket buffer closed');
        });

        wsBuffer.onUpdated(bufferUpdated => {
            setBuffer(bufferUpdated);
        });

        wsBuffer.onBufferReady(() => {
            toast.success('Buffer finished saving the camera frames');
        });

        wsBuffer.onDetectionFinished(() => {
            toast.success('Detection finished');
            setRunningDetection(false);
            getDiffFrames();
        });

        wsBuffer.onTaskCanceled(message => {
            setRunningDetection(false);
            toast.error('Unable to execute task: ' + message);
        });

        return () => {
            console.debug('Freeing images');
            cameraImages.freeImages();
            diffImages.freeImages();

            wsBuffer.close();
        };
    }, [props.bufferID]);

    useEffect(() => {
        if (!buffer) return;

        const state = buffer.state;

        if (state == 'detected') {
            toast.info('Getting diff frames, this might take a while', {
                autoClose: 1000,
            });

            setRunningDetection(false);
            executePlayerAction('play');
            getCameraFrames();
            getDiffFrames();
        } else if (state == 'with_buffer') {
            toast.info('Getting camera frames, this might take a while', {
                autoClose: 1000,
            });
            executePlayerAction('play');
            getCameraFrames();
        } else {
            toast.info(
                `Wait ${buffer.duration} seconds until the server records all images from the camera..`,
                { autoClose: parseInt(buffer.duration) },
            );
            console.log("buffer still doesn't have the frames");
        }

        if (buffer) saveLocalObject(Key.LAST_DEBUG_BUFFER, buffer);
    }, [buffer?.state, buffer?.id]);

    useEffect(() => {
        executePlayerAction('clear');
    }, [showViews]);

    //const buttonsColor = playing ? 'warning' : 'default';

    const onRunDetection = () => {
        setRunningDetection(true);
        wsBuffer.send('do_detection');
    };

    const onDeleteBuffer = () => {
        videoBufferService
            .deleteBuffer(props.bufferID)
            .ok(() => {
                toast.info('Deleted', { autoClose: 500 });
                props.onDelete();
                removeLocal(Key.LAST_DEBUG_BUFFER);
            })
            .fail(() => {
                toast.error('Could not delete it, try again', {
                    autoClose: 1000,
                });
            });
    };

    const executePlayerAction = (
        action:
            | 'play'
            | 'pause'
            | 'next'
            | 'previous'
            | 'restart'
            | 'clear'
            | 'toggleCounter',
    ) => {
        if (!buffer || !buffer.fps || !canvasPlayer.current) return;

        switch (action) {
            case 'play':
                canvasPlayer.current.play();
                setPlaying(true);
                break;
            case 'pause':
                canvasPlayer.current.pause();
                setPlaying(false);
                break;
            case 'next':
                canvasPlayer.current.next();
                break;
            case 'previous':
                canvasPlayer.current.previous();
                break;
            case 'restart':
                canvasPlayer.current.restart();
                break;
            case 'clear':
                canvasPlayer.current.redrawWithNewData();
                break;
            case 'toggleCounter':
                canvasPlayer.current.toggleFrameCounter();
                break;
        }
    };

    return (
        <Stack direction={'column'} ref={containerRef}>
            <Grid container spacing={1} sx={{ pb: '10px' }}>
                <Grid item xs={6} className="centered">
                    {/*<Typography
                        variant="overline"
                        color={'gray'}
                        sx={{ pr: '10px' }}>
                        SHOW
                    </Typography>*/}

                    <ButtonGroup
                        variant="outlined"
                        aria-label="outlined button group">
                        {buttons.map(button => (
                            <Button
                                key={button.e}
                                disabled={
                                    runningDetection ||
                                    !has_flag(
                                        enable_buttons_map[
                                            buffer?.state || 'without_buffer'
                                        ],
                                        button.e,
                                    )
                                }
                                variant={
                                    has_flag(showViews, button.e)
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={() => toggleView(button.e)}>
                                {button.title}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Grid>

                <Grid item xs={4} className="centered">
                    <LoadingButton
                        loading={runningDetection}
                        variant="outlined"
                        color="warning"
                        onClick={onRunDetection}>
                        Run detection
                    </LoadingButton>
                </Grid>

                <Grid item xs={2}>
                    <Stack direction={'row'} className="centered">
                        <IconButton
                            disabled={!buffer}
                            aria-label="previous"
                            onClick={() => executePlayerAction('previous')}>
                            <SkipPrevious />
                        </IconButton>
                        <IconButton
                            disabled={!buffer}
                            aria-label={playing ? 'Pause' : 'Play'}
                            onClick={() =>
                                executePlayerAction(playing ? 'pause' : 'play')
                            }>
                            {playing ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton
                            disabled={!buffer}
                            aria-label="next"
                            onClick={() => executePlayerAction('next')}>
                            <SkipNext />
                        </IconButton>
                        <Divider orientation="vertical" flexItem />
                        <IconButton
                            disabled={!buffer}
                            aria-label="restart"
                            onClick={() => executePlayerAction('restart')}>
                            <Replay />
                        </IconButton>
                    </Stack>
                </Grid>
            </Grid>

            {/*{buffer?.state !== 'detected' && (
                <Box className="centered" sx={{ padding: '10px' }}>
                    <Typography>Running detection on frames</Typography>

                    <LinearProgress sx={{ width: '100%' }} />
                </Box>
            )}*/}

            {buffer && buffer.fps && canvasSize.width != 0 && (
                <CanvasHandlerBufferPlayer
                    ref={canvasPlayer}
                    blobs={buffer.blobs}
                    fps={buffer.fps}
                    contours={buffer.contours}
                    diffFrameStore={diffImages}
                    cameraFrameStore={cameraImages}
                    canvasSize={canvasSize}
                    draw={{
                        cameraFrame: has_flag(showViews, RoomView.RAW),
                        diff:
                            buffer.state == 'detected' &&
                            has_flag(showViews, RoomView.DIFF),
                        contours:
                            buffer.state == 'detected' &&
                            has_flag(showViews, RoomView.CONTOURS),
                        blobs:
                            buffer.state == 'detected' &&
                            has_flag(showViews, RoomView.BLOBS),
                    }}
                />
            )}

            {buffer && !buffer.fps && canvasSize.width != 0 && (
                <Skeleton
                    variant="rectangular"
                    width={canvasSize.width}
                    height={canvasSize.height}
                />
            )}

            {buffer && (
                <Stack
                    justifyContent={'space-between'}
                    direction={'row'}
                    sx={{ pt: '10px' }}>
                    <Button
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => executePlayerAction('toggleCounter')}>
                        Toggle frame counter
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Delete />}
                        onClick={onDeleteBuffer}>
                        Delete buffer
                    </Button>
                </Stack>
            )}
        </Stack>
    );
}
