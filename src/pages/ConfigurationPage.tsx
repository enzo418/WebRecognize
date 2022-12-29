import {
    Box,
    Collapse,
    createTheme,
    Grid,
    List,
    responsiveFontSizes,
    Stack,
    ThemeProvider,
    Typography,
    useMediaQuery,
} from '@mui/material';
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import MonitorIcon from '@mui/icons-material/Monitor';

import '../styles/ConfigurationPage.scss';
import ListItemLink from '../components/ListItemLink';

import {
    Routes,
    Route,
    Outlet,
    useParams,
    useMatch,
    useNavigate,
} from 'react-router-dom';
import { ensure } from '../utils/error';
import {
    AddAPhotoOutlined,
    ArrowBack,
    Contrast,
    ExpandLess,
    ExpandMore,
    Telegram,
    Videocam,
} from '@mui/icons-material';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import SensorOccupiedIcon from '@mui/icons-material/SensorOccupied';
import TuneIcon from '@mui/icons-material/Tune';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import {
    ConfigurationContext,
    UpdateFieldCallback,
} from '../context/configurationContext';
import { configurationService } from '../services/api/Services';
import TypedPromise from '../TypedPromise';
import IProblemJson from '../services/api/interfaces/IProblemJson';
import CachedConfiguration from '../modules/CachedConfiguration';
import eventBus from '../EventBus';

import { Key, removeLocal, saveLocal } from '../LocalStore';

interface IConfigurationListElement {
    to: string; // relative path
    primary: string; // primary element text
    icon: JSX.Element; // element icon
    elements?: IConfigurationListElement[]; // nested elements
}

interface IConfigurationListType {
    getPath: (params: any) => string;
    elements: IConfigurationListElement[];
}

interface IConfigurationList {
    general: IConfigurationListType;
    camera: IConfigurationListType;
}

const getBasicConfigurationMenu = () => {
    return {
        general: {
            getPath: (params: any) => `/configuration/${params.id}/general`,
            elements: [
                {
                    to: 'basics',
                    primary: 'Basics',
                    icon: <TuneIcon />,
                },
                {
                    to: 'notifications',
                    primary: 'Notifications',
                    icon: <EditNotificationsIcon />,
                    elements: [
                        {
                            to: 'telegram',
                            primary: 'Telegram',
                            icon: <Telegram />,
                        },
                        {
                            to: 'local',
                            primary: 'Local',
                            icon: <EditNotificationsIcon />,
                        },
                    ],
                },
                {
                    to: 'video-output',
                    primary: 'Video output',
                    icon: <MonitorIcon />,
                },
            ],
        },
        camera: {
            getPath: (params: any) =>
                `/configuration/${params.id}/general/camera/${params.camera_id}`,
            elements: [
                {
                    to: '<configuration_general>/basics',
                    primary: 'Back',
                    icon: <ArrowBack />,
                },
                {
                    to: 'basics',
                    primary: 'Basics',
                    icon: <TuneIcon />,
                },
                {
                    to: 'detection',
                    primary: 'Detection',
                    icon: <TrackChangesIcon />,
                },
                // {
                //    to: 'output',
                //    primary: 'Output',
                //    icon: <MonitorIcon />,
                // },
                {
                    to: 'areas',
                    primary: 'Areas',
                    icon: <FormatShapesIcon />,
                },
                {
                    to: 'blobs',
                    primary: 'Blobs',
                    icon: <SensorOccupiedIcon />,
                    elements: [
                        {
                            to: 'detection',
                            primary: 'Detection',
                            icon: <DataObjectIcon />,
                        },
                        {
                            to: 'filters',
                            primary: 'Filters',
                            icon: <DataObjectIcon />,
                        },
                        {
                            to: 'contours-filters',
                            primary: 'Contours filters',
                            icon: <DataObjectIcon />,
                        },
                        {
                            to: 'threshold-parameters',
                            primary: 'Image processing parameters',
                            icon: <Contrast />,
                        },
                    ],
                },
            ],
        },
    };
};

// This serves as a container for all the configuration pages, which are loaded as Outlets based
// on the current location. Therefore you can find those configurations in the Route in App.tsx
// Also, this container shows the menu with all the configurations available.
export default function ConfigurationPage() {
    const [open, setOpen] = React.useState<number[]>([]);
    const [computedConfiguration, setComputedConfiguration] =
        useState<IConfigurationList>(getBasicConfigurationMenu());

    const [configName, setConfigName] = useState<string>('Configuration Name');

    const [cacheConfiguration, _] = useState<CachedConfiguration>(
        new CachedConfiguration(),
    );

    const handleOpenNexted = (i: number) => {
        if (open.includes(i)) {
            setOpen(open.filter(e => e != i));
        } else {
            setOpen(open.concat([i]));
        }
    };

    const theme = responsiveFontSizes(createTheme());
    const params = ensure<{ id: any; camera_id?: string }>(useParams() as any);
    let type = ensure<{ params: any }>(useMatch('/configuration/:id/:type/*'))
        .params.type as keyof IConfigurationList; // else how are we here?
    const belowMD = useMediaQuery(theme.breakpoints.down('md'));

    if ('camera_id' in params) {
        type = 'camera';
    }

    const id = params.id;

    // CONTEXT CALLBACKS
    const updateCB: UpdateFieldCallback = (path: string, value: any) => {
        cacheConfiguration.update(path, value);
        eventBus.dispatch('updated-configuration', { path, value });
        return configurationService.setField(params.id, { field: path, value });
    };

    const getFieldCB = useCallback(
        (path: string) => {
            return new TypedPromise<any, IProblemJson>((ok, fail) => {
                configurationService
                    .getField(params.id, path)
                    .ok(v => {
                        cacheConfiguration.update(path, v);
                        ok(v);
                    })
                    .fail(e => fail(e));
            });
        },
        [cacheConfiguration, params.id],
    );

    useEffect(() => {
        function onCamerasUpdated(force: boolean) {
            const indxFound = computedConfiguration.general.elements.findIndex(
                el => el.to == 'camera',
            );

            if (force || indxFound == -1) {
                configurationService
                    .getConfigurationCameras(id)
                    .ok(cameras => {
                        // trick react to re render
                        setComputedConfiguration(prevComputed => {
                            if (force && indxFound != -1) {
                                // remove cameras entry so we calculate it again
                                prevComputed.general.elements.splice(
                                    indxFound,
                                    1,
                                );
                            }

                            prevComputed.general.elements.push({
                                to: 'camera',
                                primary: 'Cameras',
                                icon: <Videocam />,
                                elements: cameras.map(cam => ({
                                    to: cam.id + '/basics',
                                    primary: cam.name,
                                    icon: <Videocam />,
                                })),
                            });

                            prevComputed.general.elements[
                                prevComputed.general.elements.length - 1
                            ].elements?.push({
                                to: '<configuration_general>/add-camera',
                                primary: 'Add new',
                                icon: <AddAPhotoOutlined />,
                            });

                            return { ...prevComputed };
                        });
                    })
                    .fail(e =>
                        console.error('Could not get configuration cameras', e),
                    );
            }
        }

        onCamerasUpdated(false);

        getFieldCB('/name')
            .ok((name: string) => {
                setConfigName(name);
            })
            .fail(e =>
                console.error('Could not get the configuration name: ', e),
            );

        const eventCallback = () => {
            removeLocal(Key.LAST_CAMERA_CONFIGURATION_ID);
            onCamerasUpdated(true);
        };

        const onConfigRemoved = () => removeLocal(Key.LAST_CONFIGURATION_ID);

        eventBus.on('removed-camera', eventCallback);
        eventBus.on('added-camera', eventCallback);

        eventBus.on('removed-configuration', onConfigRemoved);

        return () => {
            eventBus.remove('removed-camera', eventCallback);
            eventBus.remove('added-camera', eventCallback);
            eventBus.remove('removed-configuration', onConfigRemoved);
        };
    }, [computedConfiguration.general.elements, getFieldCB, id]);

    useEffect(() => {
        saveLocal(Key.LAST_CONFIGURATION_ID, id);
    }, [id]);

    useEffect(() => {
        if (params.camera_id)
            saveLocal(Key.LAST_CAMERA_CONFIGURATION_ID, params.camera_id);
    }, [params?.camera_id]);

    eventBus.on('updated-configuration', ({ path, value }) => {
        if (path == '/name' || path == 'name') {
            setConfigName(value);
        }
    });

    const renderConfigurationListElement = (
        basePath: string,
        element: IConfigurationListElement,
        i: number,
        padding: number,
    ) => {
        // note: on medium screens and below we disable some ui elements

        const hasChildren = element.elements !== undefined;

        const configuration_general =
            computedConfiguration.general.getPath(params);

        // if has children add handler to display the children on click,
        // else set the link to the redirect location
        const props = hasChildren
            ? { onClick: () => handleOpenNexted(i) }
            : {
                  to: element.to.includes('<configuration_general>')
                      ? element.to.replace(
                            '<configuration_general>',
                            configuration_general,
                        )
                      : `${basePath}/${element.to}`,
              };

        const isSelected = props.to && location.href.includes(props.to);

        const rendered = (
            <ListItemLink
                className={
                    'configuration-option ' + (isSelected ? 'selected' : '')
                }
                key={element.primary + i}
                icon={element.icon}
                sx={{ pl: padding }}
                primary={element.primary}
                {...props}>
                {
                    //!belowMD &&
                    hasChildren &&
                        (open.includes(i) ? <ExpandLess /> : <ExpandMore />)
                }
            </ListItemLink>
        );

        const respPadding = belowMD ? Math.min(padding + 4, 8) : padding + 4;

        const children = hasChildren && (
            <Collapse
                in={open.includes(i)}
                key={element.to}
                timeout="auto"
                unmountOnExit>
                <List component="div" disablePadding>
                    {renderConfigurationListElements(
                        `${basePath}/${element.to}`,
                        ensure(element.elements),
                        respPadding,
                    )}
                </List>
            </Collapse>
        );

        return (
            <div key={i}>
                {rendered}
                {children}
            </div>
        );
    };

    const renderConfigurationListElements = (
        basePath: string,
        elements: IConfigurationListElement[],
        padding: number,
    ) =>
        elements.map((el, i) =>
            renderConfigurationListElement(basePath, el, i, padding),
        );

    // RENDER

    return (
        <ThemeProvider theme={theme}>
            <ConfigurationContext.Provider
                value={{
                    params: params,
                    updateCB,
                    getFieldCB,
                    getInitialValue: p => cacheConfiguration.get(p),
                }}>
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                    sx={{ pl: '0px' }}>
                    {/* header */}
                    <Box
                        sx={{
                            width: '100%',
                            borderBottom: '1px solid #e5e6eb',
                        }}>
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={4}>
                            <Typography
                                //fontStyle="italic"
                                fontWeight="500"
                                variant="overline"
                                fontSize={'1.5rem'}>
                                {configName}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* content */}
                    <Grid
                        container
                        spacing={{ xs: 2, md: 2 }}
                        // className="grid-padding-0"
                        sx={{ overflowWrap: 'anywhere', pl: '0px' }}>
                        <Grid item xs={12} md={2}>
                            <List
                                sx={{
                                    width: '100%',
                                    maxWidth: 360,
                                    bgcolor: 'background.paper',
                                }}
                                component="nav"
                                className="list-configurations">
                                {renderConfigurationListElements(
                                    computedConfiguration[type].getPath(params),
                                    computedConfiguration[type].elements,
                                    0,
                                )}
                            </List>
                        </Grid>
                        <Grid
                            item
                            xs
                            md
                            sx={{
                                borderLeft: belowMD ? '' : '1px solid #e5e6eb',
                                borderTop: belowMD ? '1px solid #e5e6eb' : '',
                                width: '99%',
                                pb: '60px',
                            }}>
                            <Outlet />
                        </Grid>
                    </Grid>
                </Stack>
            </ConfigurationContext.Provider>
        </ThemeProvider>
    );
}
