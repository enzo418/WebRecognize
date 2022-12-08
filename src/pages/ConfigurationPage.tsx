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
import React, {useState, useEffect, useReducer} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DataObjectIcon from '@mui/icons-material/DataObject';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import MonitorIcon from '@mui/icons-material/Monitor';

import '../styles/GeneralConfiguration.scss';
import ListItemLink from '../components/ListItemLink';

import {
    Routes,
    Route,
    Outlet,
    useParams,
    useMatch,
    useNavigate
} from 'react-router-dom';
import withParams from '../utils/missingHooks';
import {ensure} from '../utils/error';
import {ArrowBack, ExpandLess, ExpandMore, Videocam} from '@mui/icons-material';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import SensorOccupiedIcon from '@mui/icons-material/SensorOccupied';
import TuneIcon from '@mui/icons-material/Tune';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import {ConfigurationContext, UpdateFieldCallback} from '../context/configurationContext';
import {configurationService} from '../services/api/Services';

interface IConfigurationListElement {
    to: string; // relative path
    primary: string; // primary element text
    icon: JSX.Element; // element icon
    elements?: IConfigurationListElement[]; // nested elements
}

interface IConfigurationListType {
    getPath: (params:any) => string;
    elements: IConfigurationListElement[];
}

interface IConfigurationList {
    general: IConfigurationListType;
    camera: IConfigurationListType;
}

const getBasicConfigurationMenu = () => {
    return {general: {
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
            },
            {
                to: 'video-output',
                primary: 'Video output',
                icon: <MonitorIcon />,
            },
        ]},
    camera: {
        getPath: (params: any) => `/configuration/${params.id}/general/camera/${params.camera_id}`,
        elements: [
            {
                to: '<configuration_general>',
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
            }, {
                to: 'blobs',
                primary: 'Blobs',
                icon: <SensorOccupiedIcon />,
                elements: [
                    {
                        to: 'detection',
                        primary: 'Detection',
                        icon: <DataObjectIcon />,
                    }, {
                        to: 'filters',
                        primary: 'Filters',
                        icon: <DataObjectIcon />,
                    }, {
                        to: 'contours-filters',
                        primary: 'Countours filters',
                        icon: <DataObjectIcon />,
                    },
                ],
            },
        ],
    }};
};

// This serves as a container for all the configuration pages, which are loaded as Outlets based
// on the current location. Therefore you can find those configurations in the Route in App.tsx
// Also, this container shows the menu with all the configurations available.
export default function ConfigurationPage() {
    // Redirect if missing type in the parameters
    
    const [open, setOpen] = React.useState<number[]>([]);
    const [computedConfiguration, setComputedConfiguration] = useState<IConfigurationList>(
            getBasicConfigurationMenu()
    );

    const handleOpenNexted = (i:number) => {
        if (open.includes(i)) {
            setOpen(open.filter((e) => e != i));
        } else {
            setOpen(open.concat([i]));
        }
    };

    const theme = responsiveFontSizes(createTheme());
    const params = ensure<{id: any}>(useParams() as any);
    let type = ensure<{params:any}>(useMatch('/configuration/:id/:type/*'))
        .params.type as keyof IConfigurationList; // else how are we here?
    const matchesMD = useMediaQuery(
        theme.breakpoints.down('md'),
    );

    if ('camera_id' in params) {
        type = "camera";
    }

    const id = params.id;

    useEffect(() => {
        configurationService.getConfigurationCameras(id)
            .ok(cameras => {
                computedConfiguration.general.elements.push({
                        to: 'camera',
                        primary: 'Cameras',
                        icon: <Videocam />,
                        elements: cameras.map(cam => ({
                                                to: cam.id + "/basics", 
                                                primary: cam.name, 
                                                icon: <Videocam />
                                            }))  
                });
                
                // trick react to re render  
                setComputedConfiguration({...computedConfiguration});
            }).fail(e => console.error("Could not get configuration cameras", e));
    }, []);


    const ConfigurationHeader = ({name}:any) => (
        <Box sx={{width: '100%', borderBottom: '1px solid #e5e6eb'}}>
            <Stack direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={4}>
                <Typography
                    //fontStyle="italic"
                    fontWeight="500"
                    variant='overline'
                    fontSize={"1.5rem"}>{name}</Typography>
                <EditIcon sx={{cursor: 'pointer', color: 'text.secondary'}}/>
            </Stack>
        </Box>);

    const renderConfigurationListElement = (
        basePath:string,
        element:IConfigurationListElement,
        i:number,
        padding:number) => {
        // note: on medium screens and below we disable some ui elements

        const hasChildren = element.elements !== undefined;

        const configuration_general = computedConfiguration.general.getPath(params);

        // if has children add handler to display the children on click,
        // else set the link to the redirect location
        const props = hasChildren ?
            {onClick: () => handleOpenNexted(i)} :
            {
                to: element.to === "<configuration_general>" 
                    ? configuration_general : `${basePath}/${element.to}`
            };

        const rendered = <ListItemLink
            className="configuration-option"
            key={element.primary + i}
            icon={element.icon}
            sx={{ pl: padding }}
            primary={element.primary}
            {...props}
        >
            {!matchesMD && hasChildren && (open.includes(i) ? <ExpandLess /> : <ExpandMore />)}
        </ListItemLink>;

        const respPadding = !matchesMD ? padding + 4 : 0;

        const children = hasChildren &&
        <Collapse in={open.includes(i)} key={element.to} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
                {renderConfigurationListElements(
                    `${basePath}/${element.to}`,
                    ensure(element.elements),
                    respPadding,
                )}
            </List>
        </Collapse>;

        return <div key={i}>
            {rendered}
            {children}
        </div>;
    };

    const renderConfigurationListElements =
        (basePath:string, elements:IConfigurationListElement[], padding:number) =>
            elements.map((el, i) => renderConfigurationListElement(basePath, el, i, padding));

    // CONTEXT CALLBACKS
    const updateCB:UpdateFieldCallback = (path:string, value:any) =>
        configurationService.setField(params.id, {field: path, value});
    
    const getFieldCB = (path:string) => configurationService.getField(params.id, path);

    // RENDER

    return <ThemeProvider theme={theme}>
        <ConfigurationContext.Provider value={{params: params, updateCB, getFieldCB}}>
            <Stack direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{pl: '0px'}}>
                {/* header */}
                <ConfigurationHeader name="Configuration Name"/>

                {/* content */}
                <Grid
                    container
                    spacing={{xs: 2, md: 2}}
                    // className="grid-padding-0"
                    sx={{overflowWrap: 'anywhere', pl: '0px'}}>
                    <Grid item xs sm={1} md={2}>
                        {/* LeftMenuItems */}
                        <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                            }}
                            component="nav"
                            className='list-configurations'
                        >
                            {
                                renderConfigurationListElements(
                                    computedConfiguration[type].getPath(params),
                                    computedConfiguration[type].elements,
                                    0,
                                )
                            }
                        </List>
                    </Grid>
                    <Grid item xs={10} sm={11} md={10}
                        sx={{borderLeft: '1px solid #e5e6eb', width: '99%'}}>
                        <Outlet />
                    </Grid>
                </Grid>
            </Stack>
        </ConfigurationContext.Provider>
    </ThemeProvider>;
}

