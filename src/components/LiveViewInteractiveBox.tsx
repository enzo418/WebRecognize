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

    const player = React.createRef<LiveView>();
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

        if (playing) {
            togglePlaying();
        }

        const features =
            'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=400,height=300';
        const newWindow = window.open('', '_blank', features);
        if (!newWindow) return;

        setMode(Mode.PictureInPicture);

        newWindow.document.write(`
        <html>
            <head>
            <title>Image Window</title>
            </head>
            <body style="margin:0">
            <img src="${player.current.realSource}" alt="Image" style="display: block; width: 100%; height: 100%;">
            </body>
        </html>
        `);

        newWindow.addEventListener('beforeunload', () => {
            console.log('closing pip... resuming player');
            if (player.current && !playing) {
                togglePlaying();
            }
        });
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
            <LiveView
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
