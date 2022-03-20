import React from 'react';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import {TimelineDotProps} from '@mui/lab/TimelineDot/TimelineDot';
import {useVirtual} from 'react-virtual';
import {Box} from '@mui/material';

export interface ITimelineItem {
    id: string | number;
    left: string;
    right: string;
    knobColor: any;
    grayOut: 'left' | 'right' | 'both' | 'none';
};

import '../styles/DiscreteScrollbar.scss';

interface ITimeLineAlternateProps {
    elements: ITimelineItem[];
};

export default function TimeLineAlternate(props: ITimeLineAlternateProps) {
    const parentRef = React.useRef<any>();

    const rowVirtualizer = useVirtual({
        size: props.elements.length,
        parentRef,
        estimateSize: React.useCallback((i) => 80, []),
        overscan: 5,
    });

    function TimeLineGenerateElement(props:any) {
        const {index, size, start, element} = props;

        return (<TimelineItem
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${size}px`,
                transform: `translateY(${start}px)`,
                padding: 0,
            }}>
            <TimelineContent
                color={
                    ['both', 'left'].includes(element.grayOut) ?
                        'text.secondary' :
                        'text.primary'
                }
                sx={{ m: '0', px: 0, pr: '10px' }}
                align="right">
                {element.left}
            </TimelineContent>
            <TimelineSeparator>
                <TimelineDot sx={{backgroundColor: element.knobColor}}/>
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent color={
                ['both', 'right'].includes(element.grayOut) ?
                    'text.secondary' :
                    'text.primary'
            }>{element.right}</TimelineContent>
        </TimelineItem>);
    }

    return (
        <React.Fragment>
            <Box
                className='discrete-scroll'
                sx={{bgcolor: 'background.paper', overflowX: 'hidden'}}
                ref={parentRef}
                style={{
                    height: `99vh`,
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                    padding: 0,
                }}>
                <Timeline>
                    <div
                        style={{
                            height: `${rowVirtualizer.totalSize}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.virtualItems.map((virtualRow) => (
                            <TimeLineGenerateElement
                                key={virtualRow.index}
                                index={virtualRow.index}
                                size={virtualRow.size}
                                start={virtualRow.start}
                                element={props.elements[virtualRow.index]}/>
                        ))}
                    </div>
                </Timeline>
            </Box>
        </React.Fragment>
    );
}
