import React, { useRef } from 'react';
import LiveViewBox, { LiveViewBoxProps } from './LiveViewBox';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import StopIcon from '@mui/icons-material/Stop';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import IconButton from '@mui/material/IconButton';
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';

import '../../styles/LiveViewInteractiveBox.scss';
import LiveView from '../../modules/LiveView/MJPEGStreamLiveView';
import WebRTCLiveView from '../../modules/LiveView/WebRTCLiveView';
import LiveViewSelector from '../../modules/LiveView/LiveViewSelector';
import ILiveView from '../../modules/LiveView/ILiveView';
import { is } from 'date-fns/locale';
import IProblemJson from '../../services/api/interfaces/IProblemJson';

interface LiveViewInteractiveBoxProps extends LiveViewBoxProps {
    showControls?: boolean;
    showResize?: boolean;
    showFullscreen?: boolean;
    showPIP?: boolean;
    showMiniPlayer?: boolean;
    showPlayStop?: boolean;

    playerHeight?: string;
}

enum Mode {
    Fullscreen,
    PictureInPicture,
    MiniPlayer,
    Normal,
}

export default function LiveViewInteractiveBox(
    props: LiveViewInteractiveBoxProps,
) {
    const [playing, setPlaying] = React.useState<boolean>(true);
    const [mode, setMode] = React.useState<Mode>(Mode.Normal);
    const [error, setError] = React.useState<string>('');

    const player = useRef<ILiveView>(null);
    const playerUI = useRef<HTMLDivElement>(null);

    const togglePlaying = () => {
        setError('');

        if (player.current) {
            if (playing) {
                player.current.stop();
            } else {
                player.current.play();
            }

            //setPlaying(!playing); // at onPlaying, onStopped
        }
    };

    const openPictureInPicture = async () => {
        if (!player.current) return;

        const onClose = () => {
            setMode(Mode.Normal);
        };

        if (await player.current.tryPictureInPicture(onClose)) {
            setMode(Mode.PictureInPicture);
        }
    };

    const toggleFullScreen = () => {
        if (!player.current) return;

        if (mode == Mode.Fullscreen) {
            document.exitFullscreen();
            setMode(Mode.Normal);
        } else {
            playerUI.current?.requestFullscreen();
            setMode(Mode.Fullscreen);
        }
    };

    const onError = (e?: IProblemJson) => {
        setPlaying(false);
        const message =
            (e?.title ?? 'Unknown error') + '. Try refreshing the page.';
        setError(message);
        props.onError(e);
    };

    const onPlaying = () => {
        setPlaying(true);
        if (props.onPlaying) props.onPlaying();
    };

    const onStopped = () => {
        setPlaying(false);
        if (props.onStopped) props.onStopped();
    };

    return (
        <Stack
            ref={playerUI}
            sx={{
                padding: '2px',
                //paddingBottom: '18px',
                backgroundColor: '#07060a4f',
                width: 'auto',
                height: props.playerHeight ? props.playerHeight : 'fit-content',
                borderRadius: '3px',
                boxShadow: '0px 1px 4px 0px rgb(36 35 35)',
            }}
            direction={'column'}>
            {error.length > 0 && (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000000',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <Box
                        sx={{
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            padding: '10px',
                            borderRadius: '3px',
                            boxShadow: '0px 1px 4px 0px rgb(36 35 35)',
                        }}>
                        {error}
                    </Box>
                </Box>
            )}

            {error.length == 0 && (
                <LiveViewSelector
                    {...props}
                    onError={onError}
                    ref={player}
                    style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'overlay',
                    }}
                    onPlaying={onPlaying}
                    onStopped={onStopped}
                />
            )}

            <Stack
                direction={'row'}
                justifyContent={'space-between'}
                padding={'0 5px'}>
                <Box>
                    {playing ? (
                        <IconButton aria-label="stop" onClick={togglePlaying}>
                            <StopIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            onClick={togglePlaying}
                            aria-label="play"
                            color={'warning'}>
                            <PlayArrowIcon />
                        </IconButton>
                    )}
                </Box>

                <Box display={'flex'} gap={'13px'}>
                    <IconButton
                        aria-label="mini player"
                        onClick={openPictureInPicture}>
                        <PictureInPictureAltIcon />
                    </IconButton>
                    <IconButton
                        aria-label="toggle full screen"
                        onClick={toggleFullScreen}>
                        {mode == Mode.Fullscreen ? (
                            <FullscreenExitIcon />
                        ) : (
                            <FullscreenIcon />
                        )}
                    </IconButton>
                </Box>
            </Stack>
        </Stack>
    );
}
