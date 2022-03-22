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

export interface ITimelineItemBase {
    readonly isSeparator: boolean;
};

export interface ITimelineItem extends ITimelineItemBase {
    readonly isSeparator: false;

    id: string | number;
    left: string;
    right: string;
    knobColor: any;
    grayOut: 'left' | 'right' | 'both' | 'none';
};

export interface ITimelineItemSectionSeparator extends ITimelineItemBase {
    readonly isSeparator: true;

    text: string;
    textColor?: string;
    separatorColor?: string;
};

import '../styles/DiscreteScrollbar.scss';
import {Grid} from '@mui/material';

export type ClickCallback = (id: ITimelineItem['id']) => any;

interface ITimeLineAlternateProps {
    elements: Array<ITimelineItem | ITimelineItemSectionSeparator>;
    onclick: ClickCallback;
};

export default function TimeLineAlternate(props: ITimeLineAlternateProps) {
    const parentRef = React.useRef<any>();

    const rowVirtualizer = useVirtual({
        size: props.elements.length,
        parentRef,
        estimateSize: React.useCallback((i) => 80, []),
        overscan: 5,
    });

    function TimeLineGenerateElementSeparator(props:any) {
        const {index, size, start, element} = props;

        return (
            <TimelineItem
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${size}px`,
                    transform: `translateY(${start}px)`,
                    padding: 0,
                }}
                className="only-separator">
                <TimelineSeparator>
                    <TimelineConnector sx={{backgroundColor: element.separatorColor}}/>
                </TimelineSeparator>

                <TimelineContent color={
                    ['both', 'right'].includes(element.grayOut) ?
                        'text.secondary' :
                        'text.primary'
                }>{element.text}</TimelineContent>
            </TimelineItem>);
    }

    function TimeLineGenerateElement(props:any) {
        const {index, size, start, element, onclick} = props;

        return (<TimelineItem
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${size}px`,
                transform: `translateY(${start}px)`,
                padding: 0,
            }}
            onClick={() => onclick(element.id)}>
            <Grid container spacing={2}>
                <Grid item xs={5}>
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
                </Grid>

                <Grid item xs={2}>
                    <TimelineSeparator>
                        <TimelineDot sx={{backgroundColor: element.knobColor}}/>
                        <TimelineConnector />
                    </TimelineSeparator>
                </Grid>

                <Grid item xs={5}>
                    <TimelineContent color={
                        ['both', 'right'].includes(element.grayOut) ?
                            'text.secondary' :
                            'text.primary'
                    }>{element.right}</TimelineContent></Grid>
            </Grid>

        </TimelineItem>);
    }

    function TimeLineItemGenerator(props:any) {
        const {separators, index, size, start, element, onclick} = props;

        let htmlElem :any;

        if (element.isSeparator) {
            htmlElem = (<TimeLineGenerateElementSeparator
                index={index}
                size={size}
                start={start}
                element={element}/>
            );
        } else {
            htmlElem = (<TimeLineGenerateElement
                index={index}
                size={size}
                start={start}
                element={element}
                onclick={onclick}/>
            );
        }

        return htmlElem;
    }

    return (
        <React.Fragment>
            <Box
                className='discrete-scroll'
                sx={{bgcolor: 'background.paper', overflowX: 'hidden'}}
                ref={parentRef}
                style={{
                    height: `90vh`,
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
                        {rowVirtualizer.virtualItems.map((virtualRow) => {
                            return (<TimeLineItemGenerator
                                key={virtualRow.index}
                                index={virtualRow.index}
                                size={virtualRow.size}
                                start={virtualRow.start}
                                element={props.elements[virtualRow.index]}
                                onclick={props.onclick}/>
                            );
                        })}
                    </div>
                </Timeline>
            </Box>
        </React.Fragment>
    );
}
