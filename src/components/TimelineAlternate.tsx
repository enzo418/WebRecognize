import React, { useEffect, useState } from 'react';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

import { useVirtual } from 'react-virtual';
import { Box, Theme } from '@mui/material';

export interface ITimelineItemBase {
    readonly isSeparator: boolean;
}

export interface ITimelineItem extends ITimelineItemBase {
    readonly isSeparator: false;

    id: string | number;
    left: string;
    right: string;
    knobColor: any;
    grayOut: 'left' | 'right' | 'both' | 'none';

    // if mark is true the knob will be different
    mark: boolean;
}

export interface ITimelineItemSectionSeparator extends ITimelineItemBase {
    readonly isSeparator: true;

    text: string;
    textColor?: string;
    separatorColor?: string;
}

import '../styles/DiscreteScrollbar.scss';
import { Grid } from '@mui/material';

export type ClickCallback = (id: ITimelineItem['id']) => any;

interface ITimeLineAlternateProps {
    elements: Array<ITimelineItem | ITimelineItemSectionSeparator>;
    onclick: ClickCallback;
    onFetchNextPage: () => any;
    hasMorePages: boolean;
}

interface TimeLineItemGeneratorProps {
    index: number;
    size: number;
    start: number;
    element: ITimelineItemBase;
    onclick: ClickCallback;
}

function TimeLineItemGenerator(props: TimeLineItemGeneratorProps) {
    const { index, size, start, element, onclick } = props;

    let htmlElem: any;

    if (element.isSeparator) {
        htmlElem = (
            <TimeLineGenerateElementSeparator
                index={index}
                size={size}
                start={start}
                element={element}
            />
        );
    } else {
        htmlElem = (
            <TimeLineGenerateElement
                index={index}
                size={size}
                start={start}
                element={element}
                onclick={onclick}
            />
        );
    }

    return htmlElem;
}

function TimeLineGenerateElementSeparator(props: any) {
    const { size, start, element } = props;

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
                <TimelineConnector
                    sx={{ backgroundColor: element.separatorColor }}
                />
            </TimelineSeparator>

            <TimelineContent
                color={
                    ['both', 'right'].includes(element.grayOut)
                        ? 'text.secondary'
                        : 'text.primary'
                }>
                {element.text}
            </TimelineContent>
        </TimelineItem>
    );
}

function TimeLineGenerateElement(props: any) {
    const { size, start, element, onclick } = props;

    return (
        <TimelineItem
            className={element.mark ? 'selected' : ''}
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
                            ['both', 'left'].includes(element.grayOut)
                                ? 'text.secondary'
                                : 'text.primary'
                        }
                        sx={{ m: '0', px: 0, pr: '10px' }}
                        align="right">
                        {element.left}
                    </TimelineContent>
                </Grid>

                <Grid item xs={2} sx={{ display: 'flex' }}>
                    <TimelineSeparator>
                        <TimelineDot
                            sx={{
                                cursor: 'pointer',
                                border: element.mark ? '2px solid black' : '',
                                backgroundColor: (theme: Theme) =>
                                    element.mark
                                        ? theme.palette.primary.main
                                        : element.knobColor,
                                boxShadow: (theme: Theme) =>
                                    element.mark
                                        ? `0px 0px 4px 3px ${theme.palette.primary.main}`
                                        : '',
                            }}
                        />
                        <TimelineConnector />
                    </TimelineSeparator>
                </Grid>

                <Grid item xs={5}>
                    <TimelineContent
                        color={
                            ['both', 'right'].includes(element.grayOut)
                                ? 'text.secondary'
                                : 'text.primary'
                        }>
                        {element.right}
                    </TimelineContent>
                </Grid>
            </Grid>
        </TimelineItem>
    );
}

export default function TimeLineAlternate(props: ITimeLineAlternateProps) {
    const parentRef = React.useRef<any>();

    const [isFetchingNextPage, setIsFetchingNextPage] =
        useState<boolean>(false);

    const [prevElementsCount, setPrevElementsCount] = useState<number>(
        props.elements.length,
    );

    const rowVirtualizer = useVirtual({
        size: props.elements.length,
        parentRef,
        estimateSize: React.useCallback(() => 80, []),
        overscan: 5,
    });

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.virtualItems].reverse();

        if (!lastItem) {
            return;
        }

        if (
            lastItem.index >= props.elements.length - 1 &&
            props.hasMorePages &&
            !isFetchingNextPage
        ) {
            setIsFetchingNextPage(true);
            props.onFetchNextPage();
        }
    }, [props.hasMorePages, rowVirtualizer.virtualItems]);

    useEffect(() => {
        console.log({
            e: props.elements.length,
            prev: prevElementsCount,
            setIsFetchingNextPage: isFetchingNextPage,
        });
        if (props.elements.length !== prevElementsCount) {
            setIsFetchingNextPage(false);
            setPrevElementsCount(props.elements.length);
        }
    }, [props.elements]);

    return (
        <React.Fragment>
            <Box
                className="discrete-scroll"
                sx={{ bgcolor: 'background.paper', overflowX: 'hidden' }}
                ref={parentRef}
                style={{
                    height: `97vh`,
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
                        }}>
                        {rowVirtualizer.virtualItems.map(virtualRow => {
                            return (
                                <TimeLineItemGenerator
                                    key={virtualRow.index}
                                    index={virtualRow.index}
                                    size={virtualRow.size}
                                    start={virtualRow.start}
                                    element={props.elements[virtualRow.index]}
                                    onclick={props.onclick}
                                />
                            );
                        })}
                    </div>
                </Timeline>
            </Box>
        </React.Fragment>
    );
}
