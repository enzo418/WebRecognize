import {
    Button,
    ButtonGroup,
    Drawer,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Theme,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    responsiveFontSizes,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import DTOObserverStatus, {
    CameraType,
    DTOCameraStatus,
} from '../../services/api/interfaces/DTOObserverStatus';
import eventBus from '../../EventBus';
import { cameraService, observerService } from '../../services/api/Services';

import TypedPromise from '../../TypedPromise';
import IProblemJson from '../../services/api/interfaces/IProblemJson';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { DashboardItemContext } from './DashboardItemContext';
import {
    NotificationsActiveOutlined,
    StopCircleOutlined,
    VisibilityOutlined,
} from '@mui/icons-material';

const SelectTimeMenu = ({ handleSelectTime }: any) => (
    <Grid container spacing={1}>
        {[/*m*/ 5, 15, 30, /*h*/ 1, 5, 25].map((time, i) => (
            <Grid
                item
                xs={6}
                sx={{
                    width: '30px !important',
                }}>
                <MenuItem
                    onClick={() =>
                        handleSelectTime(time * (i >= 3 ? 3600 : 60))
                    }
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                    {time}
                    {i >= 3 ? 'h' : 'm'}
                </MenuItem>
            </Grid>
        ))}
    </Grid>
);

const ExecuteActionMenu = ({
    sx,
    onIndefinitely,
    onTemporarily,
    action,
}: any) => {
    const [temporarily, setTemporarily] = React.useState<boolean | null>(null);

    return (
        <>
            {temporarily === null && (
                <ButtonGroup sx={sx} orientation="vertical" variant="text">
                    <Button
                        onClick={() => onIndefinitely()}
                        endIcon={<KeyboardArrowRightIcon />}>
                        {action} indefinitely
                    </Button>
                    <Button
                        onClick={() => setTemporarily(true)}
                        endIcon={<KeyboardArrowRightIcon />}>
                        {action} temporarily
                    </Button>
                </ButtonGroup>
            )}

            {temporarily && <SelectTimeMenu handleSelectTime={onTemporarily} />}
        </>
    );
};

const StatusIconButton = ({
    helpText,
    title,
    pressed,
    children,
    sx,
    ...rest
}: any) => (
    <Tooltip title={title}>
        <IconButton
            aria-label={title}
            aria-haspopup="true"
            aria-aria-expanded={pressed ? true : undefined}
            aria-controls={pressed ? 'select-time-menu' : undefined}
            disableRipple
            color="primary"
            sx={{
                padding: '2px 3px',
                backgroundColor: (theme: Theme) =>
                    pressed
                        ? theme.palette.action.selected
                        : theme.palette.mode == 'dark'
                        ? '#00000045'
                        : 'transparent',
                height: 'fit-content',
                borderRadius: '1px',
                margin: '0 2px',
                ...sx,
            }}
            {...rest}>
            {children}
        </IconButton>
    </Tooltip>
);

function CameraStatus({
    onStatusChanged,
    status,
    sx,
}: {
    onStatusChanged: (s: DTOCameraStatus) => any;
    status: DTOCameraStatus;
    sx?: any;
}) {
    const originalType = status.dynamicType.originalType;

    // Menu
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [targetType, setTargetType] = React.useState<CameraType>(
        CameraType.Disabled,
    );
    const menuOpen = Boolean(anchorEl);

    const currentTheme = useTheme();
    const theme = responsiveFontSizes(currentTheme as any);
    const belowMD = useMediaQuery(theme.breakpoints.down('md'));

    const handleClick = (
        CameraType: CameraType,
        event: React.MouseEvent<HTMLElement>,
    ) => {
        setAnchorEl(event.currentTarget);
        setTargetType(CameraType);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeStatusRequest = (
        promise: TypedPromise<DTOCameraStatus, IProblemJson>,
    ) => {
        promise.ok(onStatusChanged).catch((e: any) => {
            console.log(`Couldn't change the type of '${status.name}'`, e);
        });
    };

    const handleSelectTime = (time_seconds: number | undefined) => {
        if (time_seconds === undefined) {
            handleChangeStatusRequest(
                cameraService.changeIndefinitelyType(status.name, targetType),
            );
        } else {
            handleChangeStatusRequest(
                cameraService.changeTemporalType(
                    status.name,
                    targetType,
                    time_seconds,
                ),
            );
        }

        handleClose();
    };

    const getEndDate = () =>
        new Date(
            new Date().getTime() + status.dynamicType.secondsLeft * 1000,
        ).toLocaleString();

    const ActionContent = useMemo(
        () => (
            <Stack direction="column" alignItems={'center'}>
                <Typography
                    variant="overline"
                    color="GrayText"
                    sx={{
                        p: 1,
                        pt: '0',
                    }}>
                    Change type to {targetType}
                </Typography>
                <ExecuteActionMenu
                    onIndefinitely={handleSelectTime}
                    onTemporarily={handleSelectTime}
                    action={''}
                    sx={{
                        width: '100%',
                    }}
                />
            </Stack>
        ),
        [targetType],
    );

    const onChangeToggle = (
        event: React.MouseEvent<HTMLElement>,
        newTargetType: CameraType,
    ) => {
        if (newTargetType !== null) {
            setTargetType(newTargetType);
            handleClick(newTargetType, event);
        }
    };

    return (
        <Stack
            direction="row"
            justifyContent={'space-between'}
            sx={{
                '&:hover .status-help-text': {
                    opacity: 1,
                },
                ...sx,
            }}>
            <Stack
                direction="column"
                sx={{
                    p: 0,
                    m: 0,
                }}>
                {/*{status.currentType !== CameraType.Disabled ? (
                    <LiveIndicator size={10} type={2} />
                ) : (
                    <LiveIndicator size={10} type={2} />
                )}*/}

                <Typography variant="overline" pl="10px">
                    {status.name}
                </Typography>

                <Typography
                    className="status-help-text"
                    variant="overline"
                    color="GrayText"
                    fontSize="0.65rem"
                    sx={{
                        opacity: 0.5,
                        textTransform: 'math-auto',
                        textWrap: 'balance',
                    }}>
                    {status.dynamicType.active &&
                        !status.dynamicType.isIndefinitely &&
                        status.currentType !==
                            status.dynamicType.originalType && (
                            <>
                                {'Will go back to '}
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'dotted',
                                        textUnderlineOffset: '3px',
                                    }}>
                                    {originalType}
                                </span>{' '}
                                at {getEndDate()}
                            </>
                        )}
                </Typography>
            </Stack>

            <Stack direction="row" alignItems={'center'}>
                <ToggleButtonGroup
                    size="small"
                    color="primary"
                    value={status.currentType}
                    exclusive
                    onChange={onChangeToggle}>
                    <ToggleButton value={CameraType.Disabled} aria-label="list">
                        <StopCircleOutlined />
                    </ToggleButton>
                    <ToggleButton value={CameraType.View} aria-label="list">
                        <VisibilityOutlined />
                    </ToggleButton>
                    <ToggleButton
                        value={CameraType.Notificator}
                        aria-label="list">
                        <NotificationsActiveOutlined />
                    </ToggleButton>
                </ToggleButtonGroup>

                {!belowMD && (
                    <Menu
                        id="select-time-menu"
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': anchorEl?.id,
                        }}>
                        {ActionContent}
                    </Menu>
                )}

                {belowMD && (
                    <Drawer
                        anchor="bottom"
                        open={menuOpen}
                        onClose={handleClose}>
                        {ActionContent}
                    </Drawer>
                )}
            </Stack>
        </Stack>
    );
}

export default function CamerasStatus(props: any) {
    const [status, setStatus] = React.useState<DTOObserverStatus>({
        running: false,
        cameras: [],
    });
    const [loading, setLoading] = React.useState<boolean>(true);
    const [updateInterval, setUpdateInterval] = React.useState<any>(null);

    //const dashboardItemContext = React.useContext(DashboardItemContext);

    let lastPendingPromise = React.useRef<TypedPromise<
        any,
        IProblemJson
    > | null>(null);

    const fetchStatus = () => {
        lastPendingPromise.current = observerService
            .status()
            .ok(status => {
                setStatus(status);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        const handleStatus = (status: DTOObserverStatus) => {
            setStatus(status);
        };

        eventBus.on('observer-status-changed', handleStatus);

        fetchStatus();

        // TODO: Use a better way to update the status!
        setUpdateInterval(
            setInterval(() => {
                fetchStatus();
            }, 10000),
        );

        return () => {
            if (lastPendingPromise.current) {
                lastPendingPromise.current.cancel();
            }

            eventBus.remove('observer-status-changed', handleStatus);

            clearInterval(updateInterval);
        };
    }, []);

    const onStatusChanged = (camStatus: DTOCameraStatus) => {
        const updatedObserverStatus: DTOObserverStatus = {
            ...status,
            cameras: status.cameras.map(camera => {
                if (camera.name === camStatus.name) {
                    return camStatus;
                } else {
                    return camera;
                }
            }),
        };

        setStatus(updatedObserverStatus);

        eventBus.dispatch('observer-status-changed', updatedObserverStatus);
    };

    return (
        <Stack
            direction="column"
            className="discrete-scroll"
            sx={{
                '& > *': {
                    mb: 1,
                },
                '&:last-child': {
                    mb: 0,
                },
                overflowY: 'scroll',
                maxHeight: '86%',
            }}>
            {status.cameras.map((camera, index) => (
                <CameraStatus
                    key={index}
                    status={camera}
                    onStatusChanged={onStatusChanged}
                />
            ))}
        </Stack>
    );
}
