import {Box, Skeleton, Typography} from '@mui/material';
import React from 'react';
import config from '../config';
import LiveView from '../modules/LiveView';

interface LiveViewPageProps {

};

interface LiveViewPageState {
    loading: boolean;
    error: string;
    feedsID: string[];
};

export default class LiveViewPage extends React.Component<LiveViewPageProps, LiveViewPageState> {
    state: LiveViewPageState = {
        feedsID: [],
        loading: true,
        error: '',
    };

    constructor(props:LiveViewPageProps) {
        super(props);
    }

    componentDidMount() {
        const url = `${config.server}${config.endpoints.api.liveViewObserver}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.status !== 'error') {
                    const feedId = data['data']['ws_feed_path'].replace('/live/', '');
                    this.setState(
                        (prev) => {
                            if (prev.feedsID.indexOf(feedId) < 0) {
                                prev.feedsID.push(feedId);
                            }

                            return prev;
                        },
                    );
                } else {
                    this.setState({error: data.error});
                }
            }).catch((error) => {
                this.setState({error: 'Couldn\'t get the live feed requested'});
                console.warn('Couldn\'t get the live feed id!', {error});
            }).finally(() => this.setState({loading: false}));
    }

    render() {
        return <Box sx={{padding: '10px'}}>
            { this.state.error.length == 0 && this.state.loading ?
                <Skeleton variant="rectangular" width={640} height={360} /> :
                this.state.feedsID.map((feedID) => (
                    <LiveView
                        key={feedID}
                        feedID={feedID}
                        onLoad={() => { }} style={{}}></LiveView>),
                )
            }
            {this.state.error.length != 0 && <Typography>ERROR {this.state.error}</Typography>}
        </Box>;
    }
}
