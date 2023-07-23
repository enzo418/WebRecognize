import React from 'react';
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

import '../styles/LiveViewInteractiveBox.scss';
import LiveView from '../modules/LiveView';
import WebRTCLiveView from '../modules/WebRTCLiveView';

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

    const player = React.createRef<WebRTCLiveView>();
    const playerUI = React.createRef<HTMLDivElement>();

    const togglePlaying = () => {
        if (player.current) {
            if (playing) {
                player.current.stop();
            } else {
                player.current.play();
            }

            setPlaying(!playing);
        }
    };

    const openPictureInPicture = () => {
        if (!player.current) return;

        player.current.video.current?.requestPictureInPicture();
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

    return (
        <Stack
            ref={playerUI}
            sx={{
                padding: '2px',
                //paddingBottom: '18px',
                backgroundColor: '#07060a4f',
                width: 'fit-content',
                height: props.playerHeight ? props.playerHeight : 'fit-content',
                borderRadius: '3px',
                boxShadow: '0px 1px 4px 0px rgb(36 35 35)',
            }}
            direction={'column'}>
            <WebRTCLiveView
                {...props}
                ref={player}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'overlay',
                }}
            />

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
