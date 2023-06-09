import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
// import Typography from '@mui/material/Typography';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import {
    ThemeProvider,
    createTheme,
    useTheme,
    Theme,
} from '@mui/material/styles';

import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import SettingsIcon from '@mui/icons-material/Settings';

import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
    useLocation,
} from 'react-router-dom';

import './NavBar.scss';
import { Dashboard } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { Badge } from '@mui/material';
import { notificationService } from './services/api/Services';
import svgToIcon from './utils/icons';

interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
    badgeContent?: number;

    [x: string]: any;
}

function ListItemLink(props: ListItemLinkProps) {
    const { icon, to, badgeContent, ...rest } = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(
                function Link(itemProps, ref) {
                    return (
                        <RouterLink
                            to={to}
                            ref={ref}
                            {...itemProps}
                            role={undefined}
                        />
                    );
                },
            ),
        [to],
    );

    const currentTheme = useTheme();

    const ListItemTheme = createTheme(currentTheme, {
        components: {
            MuiListItem: {
                styleOverrides: {
                    root: {
                        margin: '0px 0px 1rem',
                        transition:
                            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                        justifyContent: 'center',
                    },
                },
            },
            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        minWidth: '0',
                    },
                },
            },
        },
    });

    return (
        <li>
            <ThemeProvider theme={ListItemTheme}>
                <ListItem button component={renderLink} {...rest}>
                    <Badge badgeContent={badgeContent || 0} color="warning">
                        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                    </Badge>
                </ListItem>
            </ThemeProvider>
        </li>
    );
}

interface NavBarProps {
    sx: object;
}

const items = [
    {
        to: '/configuration/',
        icon: svgToIcon('/icons/camera-cfg.svg'),
    },
    { to: '/notifications', icon: <NotificationsNoneIcon /> },
    //{
    //    to: '/liveView',
    //    icon: <SettingsInputAntennaIcon />,
    //},
    { to: '/dashboard', icon: <Dashboard /> },
    {
        to: 'application/configuration',
        icon: <SettingsIcon />,
    },
];

export default function NavBar(props: NavBarProps) {
    const { sx, ...rest } = props;

    let location = useLocation();

    const finalSx = {
        ...{
            bgcolor: 'background.paper',
            overflowX: 'hidden',
            borderRight: '1px solid #000',
            borderColor: (theme: Theme) => theme.palette.divider,
        },
        ...(sx || {}),
    };

    const [notificationBadgeContent, setNotificationBadgeContent] =
        useState<number>(0);

    useEffect(() => {
        const onNotification = () => {
            // location.pathname didn't update yet
            if (window.location.pathname !== '/notifications') {
                setNotificationBadgeContent(notificationBadgeContent + 1);
            }
        };

        notificationService.subscribe(onNotification);

        return () => notificationService.unsubscribe(onNotification);
    }, []);

    useEffect(() => {
        if (location.pathname == '/notifications')
            setNotificationBadgeContent(0);
    }, [location]);

    return (
        <Box className="simple-bar" sx={finalSx} {...rest}>
            <List sx={{ height: '100%' }} className="navbar-list">
                {items.map(item => (
                    <ListItemLink
                        key={item.to}
                        to={item.to}
                        primary=""
                        icon={item.icon}
                        badgeContent={
                            item.to === '/notifications'
                                ? notificationBadgeContent
                                : 0
                        }
                        sx={{
                            border:
                                location.pathname === item.to
                                    ? '1px solid #000'
                                    : '0',
                            borderLeft: '0',
                            borderRight: '0',
                            borderColor: (theme: Theme) =>
                                theme.palette.divider,
                        }}
                    />
                ))}
            </List>
        </Box>
    );
}
