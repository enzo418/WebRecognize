import React, { useEffect, useState } from 'react';
import config from '../../../config';
import { Mask, Rectangle, Size } from '../../../Geometry';
import CanvasHandlerROI from '../../../modules/CanvasHandlerROI';
import { cameraService, client } from '../../../services/api/Services';

import {
    GetFieldCallback,
    UpdateFieldCallback,
} from '../../../context/configurationContext';
import {
    Box,
    Button,
    ButtonGroup,
    Fade,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { ensure } from '../../../utils/error';
import { scaleMasks, scaleRectangle } from '../../../utils/geometry';
import CanvasHandlerPOLY from '../../../modules/CanvasHandlerPOLY';
import {
    AddCircleOutline,
    CloseFullscreen,
    Delete,
    Redo,
    Undo,
} from '@mui/icons-material';
import { HelpPopover } from '../../IconPopover';

interface MasksCanvasInputFieldProps {
    camera_id: string;
    fieldPath: string;
    enableEditing: boolean;
    fullScreen?: boolean;

    updateCB: UpdateFieldCallback;
    getFieldCB: GetFieldCallback;

    onMasksUpdated: () => any;
    onExit?: () => any;

    canvasSize: Size;

    showButtons?: boolean;
}

enum Mode {
    ADD,
    DELETE,
}

enum State {
    IDLE = ' ',
    DRAWING_POLYGON = '  ',
    LOADING_PREVIEW = 'loading preview...',
    SAVING = 'saving changes...',
    SAVED = 'changes saved',
}

export default function MasksCanvasInputField(
    props: MasksCanvasInputFieldProps,
) {
    const [image, setImage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [initialMasks, setInitialMasks] = useState<Mask[]>([]);
    const [calculatedCanvasSize, setCalculatedCanvasSize] = useState<Size>({
        width: 0,
        height: 0,
    });
    const [mode, setMode] = useState<Mode>(Mode.ADD);
    const [state, setState] = useState<State>(State.IDLE);

    const id = props.camera_id;

    const buttonHeaderRef = React.createRef<HTMLDivElement>();

    const canvasHandlerRef = React.createRef<CanvasHandlerPOLY>();

    let lastPendingPromise: any;

    const getCameraPreview = () => {
        // wait until it's calculated
        if (calculatedCanvasSize.width * calculatedCanvasSize.height == 0)
            return;

        setState(State.LOADING_PREVIEW);

        setLoading(true);

        lastPendingPromise = cameraService
            .getFrame(id)
            .ok(blob => {
                setImage(URL.createObjectURL(blob));

                // we need to get the field value now
                lastPendingPromise = props.getFieldCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                    ])
                    .ok(storedMasks => {
                        ensure<Mask[]>(storedMasks);

                        lastPendingPromise = cameraService
                            .getDefaults(id)
                            .ok(({ size }) => {
                                // we need the resize it from the real camera size to the canvas size
                                const scaleX =
                                    calculatedCanvasSize.width / size.width;
                                const scaleY =
                                    calculatedCanvasSize.height / size.height;

                                setInitialMasks(
                                    scaleMasks(storedMasks, scaleX, scaleY),
                                );

                                setLoading(false);

                                setState(State.IDLE);
                            })
                            .fail(e =>
                                console.error(
                                    'Could not get last resize (processing): ',
                                    e,
                                ),
                            )
                            .cancelled(() =>
                                console.debug('defaults cancelled'),
                            );
                    })
                    .fail(e => {
                        console.log("couldn't get the field value!", {
                            error: e,
                        });
                    })
                    .cancelled(() =>
                        console.debug('field path value cancelled'),
                    );
            })
            .fail(e => {
                console.error('Could not get the camera frame: ', e);
            })
            .cancelled(() => console.debug('camera frame cancelled'));
    };

    useEffect(() => {
        if (props.showButtons) {
            const isHorizontalDevice = screen.width > screen.height;

            let calculatedH, calculatedW;
            let { width, height } = props.canvasSize;

            if (isHorizontalDevice) {
                const bounds = ensure(
                    buttonHeaderRef.current,
                ).getBoundingClientRect();
                const headerH = bounds.height;

                calculatedH = height - headerH;
                calculatedW = width * (calculatedH / height);
            } else {
                calculatedW = width;
                calculatedH = calculatedW / (16 / 9);
            }

            setCalculatedCanvasSize({
                width: calculatedW,
                height: calculatedH,
            });
        } else setCalculatedCanvasSize(props.canvasSize);

        return () => {
            // free image from memory
            URL.revokeObjectURL(image);
        };
    }, []);

    useEffect(() => {
        getCameraPreview();

        return () => {
            if (lastPendingPromise) lastPendingPromise.cancel();
        };
    }, [props.camera_id, calculatedCanvasSize]);

    const onMasksChanged = (masks: Mask[]) => {
        setState(State.SAVING);

        // We need to get the resize again because it might have been changed here or by another user
        cameraService
            .getDefaults(id)
            .ok(({ size }) => {
                const scaleX = size.width / calculatedCanvasSize.width;
                const scaleY = size.height / calculatedCanvasSize.height;

                const scaledMasks = scaleMasks(masks, scaleX, scaleY);

                props.updateCB
                    .apply(null, [
                        `cameras/${props.camera_id}/${props.fieldPath}`,
                        scaledMasks,
                    ])
                    .ok(() => {
                        if (props.onMasksUpdated) props.onMasksUpdated();
                        setState(State.SAVED);
                    })
                    .fail(e => console.error('Could not update masks', e));
            })
            .fail(e => console.error('Could not get camera defaults: ', e));
    };

    const onChangeMode = (pMode: Mode) => {
        if (pMode == Mode.ADD) {
            canvasHandlerRef.current?.enterAddMode();
        } else if (pMode == Mode.DELETE) {
            canvasHandlerRef.current?.enterDeleteMode();
        }

        setMode(pMode);
    };

    const onPolyStarted = () => {
        setState(State.DRAWING_POLYGON);
    };

    const getStateHelpText = () => {
        if (state == State.IDLE) {
            switch (mode) {
                case Mode.ADD:
                    return 'Click in the image to add a point';
                case Mode.DELETE:
                    return 'Click on an area to delete it';
                default:
                    return '';
            }
        } else if (state == State.DRAWING_POLYGON && mode == Mode.ADD) {
            return 'Connect the polygon ends to save it';
        } else if (state.trim().length > 0) {
            return state;
        }
    };

    return (
        <>
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <ButtonGroup
                    sx={{
                        display: props.showButtons ? 'auto' : 'none',
                        ml: '3px',
                    }}
                    ref={buttonHeaderRef}
                    variant="text">
                    <Tooltip title="enter add points mode">
                        <Button
                            onClick={() => onChangeMode(Mode.ADD)}
                            variant={
                                mode == Mode.ADD ? 'contained' : 'outlined'
                            }
                            color="success"
                            aria-label=""
                            startIcon={<AddCircleOutline />}></Button>
                    </Tooltip>

                    <Tooltip title="Enter delete mode (click on a mask to delete it)">
                        <Button
                            variant={
                                mode == Mode.DELETE ? 'contained' : 'outlined'
                            }
                            onClick={() => onChangeMode(Mode.DELETE)}
                            color="warning"
                            startIcon={<Delete />}></Button>
                    </Tooltip>

                    <Tooltip title="undo last action">
                        <IconButton
                            onClick={() => canvasHandlerRef.current?.undo()}>
                            <Undo />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="redo last action">
                        <IconButton
                            onClick={() => canvasHandlerRef.current?.redo()}>
                            <Redo />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="exit edit mode">
                        <IconButton
                            onClick={() => props.onExit && props.onExit()}>
                            <CloseFullscreen />
                        </IconButton>
                    </Tooltip>
                </ButtonGroup>

                {/* Show state */}
                {props.showButtons && (
                    <Typography
                        variant="body2"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            pr:
                                screen.width > props.canvasSize.width
                                    ? '20%'
                                    : '20px',
                            pl: '10px',
                            //backgroundColor: state === '' ? '' : '#0f0f0f',
                        }}
                        color={'white'}>
                        {getStateHelpText()}
                    </Typography>
                )}
            </Stack>

            {loading ? (
                <Skeleton
                    variant="rectangular"
                    width={`min(${props.canvasSize.width}px, 100%)`}
                    height={props.canvasSize.height}
                />
            ) : (
                <>
                    {calculatedCanvasSize.width !== 0 && (
                        <CanvasHandlerPOLY
                            ref={canvasHandlerRef}
                            image={image}
                            initialPolys={initialMasks}
                            enableEditing={props.enableEditing}
                            onPolygonsChanged={onMasksChanged}
                            canvasSize={calculatedCanvasSize}
                            fullScreen={props.fullScreen}
                            onPolyStarted={onPolyStarted}
                        />
                    )}
                </>
            )}
        </>
    );
}
