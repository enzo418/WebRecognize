import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { Box, IconButton } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

interface IconPopoverProps {
    iconElement: JSX.Element;
    // Use <br> to add a new line
    text: string;
    style?: object;
}

export default function IconPopover(props: IconPopoverProps) {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null,
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    let processedText = props.text.split('<br>');

    return (
        <Box sx={props.style}>
            <IconButton aria-describedby={id} onClick={handleClick}>
                {props.iconElement}
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}>
                <Typography sx={{ p: 2 }}>
                    {processedText.map((text: string, index: number) => {
                        return (
                            <div key={index}>
                                {text}
                                <br></br>
                            </div>
                        );
                    })}
                </Typography>
            </Popover>
        </Box>
    );
}

const ProcessStyle = (style?: object) => {
    return Object.assign(
        {
            display: 'inline',
        },
        style,
    );
};

export const HelpPopover = ({ text, style }: { text: string; style?: any }) => (
    <IconPopover
        text={text}
        style={ProcessStyle(style)}
        iconElement={<HelpIcon />}
    />
);

export const WarningPopover = ({
    text,
    style,
}: {
    text: string;
    style?: any;
}) => (
    <IconPopover
        text={text}
        style={ProcessStyle(style)}
        iconElement={<WarningIcon />}
    />
);

export const InfoPopover = ({ text, style }: { text: string; style?: any }) => (
    <IconPopover
        text={text}
        style={ProcessStyle(style)}
        iconElement={<QuestionMarkIcon />}
    />
);

export const InfoTextPopover = ({
    text,
    style,
}: {
    text: string;
    style?: any;
}) => (
    <IconPopover
        text={text}
        style={ProcessStyle(style)}
        iconElement={
            // Colors: https://mui.com/system/palette/#color
            <Typography variant="body2" color={'info.main'}>
                info
            </Typography>
        }
    />
);
