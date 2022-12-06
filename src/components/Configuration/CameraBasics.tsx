import {
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    TextField,
} from '@mui/material';

import React from 'react';
import {useConfiguration} from '../../context/configurationContext';
import LiveViewBox from '../LiveViewBox';
import {SelectConfigurationField, TextConfigurationField} from './configurationField';

interface Props {
    updateField: (field:string, value:any) => any;
}

interface IConfigurationFieldProps {
    updateCB: any;
    params: any;
    name: string;
}

// function ConfigurationField(props:ConfigurationField) {
//    const {updateCB, params, name} = props;
//    const [error, setError] = useState()

//    return <TextField
//        label="name"
//        defaultValue={'test'}
//        variant="standard"
//        sx={{width: '100%'}}
//        onChange={(e) => updateCB(params, 'name', e.target.value)}
//    />;
// }


export default function CameraBasics() {
    const {params, updateCB, getFieldCB} = useConfiguration();

    const commonData = {getFieldCB, updateCB, camera: params?.camera_id};

    const [url, setUrl] = React.useState<string>("");

    return (
        <Grid
            container
            spacing={{xs: 2, md: 2}}>
            <Grid item xs={12} sm={12} md={4}>
                <TextConfigurationField
                    label="name"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData, 
                        path: 'name', 
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
                <TextConfigurationField
                    label="url"
                    variant="standard"
                    fullWidth
                    data={{
                        ...commonData, 
                        path: 'url', 
                        onValueChanged: (v) => setUrl(v)
                    }}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
                <Stack spacing={{xs: 2, md: 2}}>
                    <FormControl fullWidth>
                        <InputLabel id="camera-type">Type</InputLabel>
                        <SelectConfigurationField
                            labelId="camera-type"
                            label="Type"
                            data={{...commonData, path: 'type'}}
                        >
                            <MenuItem value={'Disabled'}>Disabled</MenuItem>
                            <MenuItem value={'Notificator'}>Notificator</MenuItem>
                            <MenuItem value={'View'}>View</MenuItem>
                        </SelectConfigurationField>
                    </FormControl>

                    <TextConfigurationField
                        label="Output rotation (degrees)"
                        variant="standard"
                        type="number"
                        fullWidth
                        data={{...commonData, path: 'rotation'}}
                    />
                </Stack>
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
                <LiveViewBox style={{width: "640px"}} uri={url} keepSkeletonOnError={true} />
            </Grid>
        </Grid>
    );
}
