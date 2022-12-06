import {
    ListItem,
    ListItemIcon,
    ListItemProps,
    ListItemText,
    SxProps,
    Theme,
    useTheme,
} from '@mui/material';
import React from 'react';
import json2mq from 'json2mq';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
    Link as RouterLink,
    LinkProps as RouterLinkProps,
} from 'react-router-dom';

interface ListItemLinkProps extends ListItemProps {
    icon?: React.ReactElement;
    primary: string;
    to?: string;
    sx?: SxProps<Theme>;
    children?: JSX.Element | boolean;
}

// a list item that has a router link
// also it's responsive because it hides the link text
// if the screen size is less than `break_point`
function ListItemLink(props: ListItemLinkProps) {
    const {icon, to, primary, ...restProps} = props;

    const renderLink = to && React.useMemo(
        () =>
            React.forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
                itemProps,
                ref,
            ) {
                return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
            }),
        [to],
    );

    const theme = useTheme();

    const matches = useMediaQuery(
        theme.breakpoints.down('md'),
    );

    return (
        <ListItem button component={to ? renderLink : 'li'} sx={props.sx} {...restProps}>
            {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
            {!matches && <ListItemText primary={primary} />}
            {props.children}
        </ListItem>
    );
}


export default ListItemLink;
