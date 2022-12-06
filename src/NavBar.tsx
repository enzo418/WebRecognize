import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
// import Typography from '@mui/material/Typography';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import {ThemeProvider, createTheme} from '@mui/material/styles';

import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import SettingsIcon from '@mui/icons-material/Settings';

import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
    // MemoryRouter,
    // useLocation,
} from 'react-router-dom';

// import {StaticRouter} from 'react-router-dom/server';

import './NavBar.scss';

// function Router(props: { children?: React.ReactNode }) {
//     const {children} = props;
//     if (typeof window === 'undefined') {
//         return <StaticRouter location="/drafts">{children}</StaticRouter>;
//     }

//     return (
//         <MemoryRouter initialEntries={['/drafts']} initialIndex={0}>
//             {children}
//         </MemoryRouter>
//     );
// }

interface ListItemLinkProps {
  icon?: React.ReactElement;
  primary: string;
  to: string;
}

const ListItemTheme = createTheme({
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    margin: '0px 0px 1rem',
                    transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
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


function ListItemLink(props: ListItemLinkProps) {
    const {icon, to, ...rest} = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
                itemProps,
                ref,
            ) {
                return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
            }),
        [to],
    );

    return (
        <li>
            <ThemeProvider theme={ListItemTheme}>
                <ListItem button component={renderLink}>
                    {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                    {/* <ListItemText primary={primary} sx={{ minWidth: '0' }} /> */}
                </ListItem>
            </ThemeProvider>
        </li>
    );
}

// function Content() {
//     const location = useLocation();
//     return (
//         <Typography variant="body2" sx={{pb: 2}} color="text.secondary">
//       Current route: {location.pathname}
//         </Typography>
//     );
// }

const NavBar: React.FC = (props:any) => {
    const {sx, ...rest} = props;

    const finalSx = {
        ...{
            bgcolor: 'background.paper',
            overflowX: 'hidden',
            borderRight: '1px solid #e5e6eb'}, /* TODO: add e5e6eb to vars*/
        ...(sx || {}),
    };

    return (
        <Box className='simple-bar'
            sx={finalSx} {...rest}>

            <List sx={{height: '100%'}}>
                <ListItemLink to="/configuration/" primary="" icon={<SettingsIcon />} />
                <ListItemLink to="/notifications" primary="" icon={<NotificationsNoneIcon />} />
                <ListItemLink to="/liveView" primary="" icon={<SettingsInputAntennaIcon />} />
            </List>
        </Box>
    );
};

export default NavBar;
