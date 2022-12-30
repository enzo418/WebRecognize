import React, { useEffect, useState } from 'react';
import { Polygon, Rectangle, Size } from '../../../Geometry';
import { cameraService } from '../../../services/api/Services';

import {
    GetFieldCallback,
    UpdateFieldCallback,
} from '../../../context/configurationContext';

import {
    Box,
    Button,
    ButtonGroup,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
} from '@mui/material';
import CanvasHandlerPOLY from '../../../modules/CanvasHandlerPOLY';
import {
    AddCircleOutline,
    CloseFullscreen,
    Delete,
    Redo,
    Undo,
} from '@mui/icons-material';
import { ensure } from '../../../utils/error';
import { scalePolygons } from '../../../utils/geometry';
import { toast } from 'react-toastify';

interface IgnoredSetsCanvasProps {
    uri?: string;
    camera_id?: string;

    fieldPath: string;
    referenceSizePath: string;

    enableEditing: boolean;
    fullScreen?: boolean;

    updateCB: UpdateFieldCallback;
    getFieldCB: GetFieldCallback;

    onSetsUpdated: () => any;
    onExit?: () => any;

    canvasSize: Size;

    showButtons?: boolean;
}

enum Mode {
    ADD,
    DELETE,
}

export default function IgnoredSetsCanvasInputField(
    props: IgnoredSetsCanvasProps,
) {
    const [image, setImage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [initialPolygons, setInitialPolygons] = useState<Polygon[]>([]);
    const [calculatedCanvasSize, setCalculatedCanvasSize] = useState<Size>({
        width: 0,
        height: 0,
    });
    const [mode, setMode] = useState<Mode>(Mode.ADD);

    const id = props.uri ? { uri: props.uri } : { camera_id: props.camera_id };

    const buttonHeaderRef = React.createRef<HTMLDivElement>();
    const canvasHandlerRef = React.createRef<CanvasHandlerPOLY>();

    let lastPendingPromise: any;
    const getCameraPreview = () => {
        // wait until it's calculated
        if (calculatedCanvasSize.width * calculatedCanvasSize.height == 0)
            return;

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
                    .ok(storedPolygons => {
                        ensure<Polygon[]>(storedPolygons);

                        lastPendingPromise = props.getFieldCB
                            .apply(null, [
                                `cameras/${props.camera_id}/${props.referenceSizePath}`,
                            ])
                            .ok(({ width, height }) => {
                                // we need the resize it from the reference size to the canvas size
                                const scaleX =
                                    calculatedCanvasSize.width / width;
                                const scaleY =
                                    calculatedCanvasSize.height / height;

                                setInitialPolygons(
                                    scalePolygons(
                                        storedPolygons,
                                        scaleX,
                                        scaleY,
                                    ),
                                );

                                setLoading(false);
                            })
                            .fail(e =>
                                console.error(
                                    'Could not get reference size:',
                                    e,
                                ),
                            )
                            .cancelled(() =>
                                console.debug('cancelled reference size'),
                            );
                    })
                    .fail(e => {
                        console.log("couldn't get the field value!", {
                            error: e,
                        });
                    })
                    .cancelled(() => console.debug('cancelled field value'));
            })
            .fail(e => {
                console.error('Could not get the camera frame: ', e);
            })
            .cancelled(() => console.debug('cancelled camera image'));
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
    }, [props.uri, props.camera_id, calculatedCanvasSize]);

    const onPolysChanged = (polys: Polygon[]) => {
        // We need to get the resize again because it might have been changed here or by another user
        props.getFieldCB
            .apply(null, [
                `cameras/${props.camera_id}/${props.referenceSizePath}`,
            ])
            .ok(({ width, height }) => {
                const scaleX = width / calculatedCanvasSize.width;
                const scaleY = height / calculatedCanvasSize.height;

                const scaledPolys = scalePolygons(polys, scaleX, scaleY);

                // TODO: Design a retry system
                const MAX_TRY = 5;
                let try_times = MAX_TRY;
                const sendSets = () => {
                    props.updateCB
                        .apply(null, [
                            `cameras/${props.camera_id}/${props.fieldPath}`,
                            scaledPolys,
                        ])
                        .ok(() => {
                            if (props.onSetsUpdated) props.onSetsUpdated();

                            if (try_times < MAX_TRY) {
                                toast.success('Updated!');
                            }
                        })
                        .fail(e => {
                            if (try_times-- > 0) {
                                toast.error(
                                    "Couldn't update the field, trying again",
                                );
                                setTimeout(() => sendSets(), 1000);
                            } else {
                                toast.error(
                                    "Couldn't update the field. Check that the server is ok",
                                );
                            }
                        });
                };

                sendSets();
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

    return (
        <>
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
                        variant={mode == Mode.ADD ? 'contained' : 'outlined'}
                        color="success"
                        aria-label=""
                        startIcon={<AddCircleOutline />}></Button>
                </Tooltip>

                <Tooltip title="Enter delete mode (click on a mask to delete it)">
                    <Button
                        variant={mode == Mode.DELETE ? 'contained' : 'outlined'}
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
                    <IconButton onClick={() => props.onExit && props.onExit()}>
                        <CloseFullscreen />
                    </IconButton>
                </Tooltip>
            </ButtonGroup>

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
                            initialPolys={initialPolygons}
                            enableEditing={props.enableEditing}
                            onPolygonsChanged={onPolysChanged}
                            canvasSize={calculatedCanvasSize}
                            fullScreen={props.fullScreen}
                            borderColor={'#fafa'}
                        />
                    )}
                </>
            )}
        </>
    );
}
