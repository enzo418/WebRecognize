import React from 'react';

import Typography from '@mui/material/Typography';

import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Camera from '../domain/Camera';

type CameraID = Camera['id'];

interface TitleTextProp {
    display: boolean;
    text: string;
};

export interface ICameraSelectorComponentProps {
    cameras: Camera[];
    camerasSelected: CameraID[];
    setCameras: any;
    titleText: TitleTextProp;
};

function CamerasSelector(props:ICameraSelectorComponentProps) {
    const toggleCamerasSelected = (id:string) => {
        props.setCameras((currentValues: CameraID[]) => {
            if (currentValues.indexOf(id) >= 0) {
                return currentValues.filter((cid) => cid != id);
            } else {
                return currentValues.concat([id]);
            }
        });
    };

    return (
        <div>
            {props.titleText.display&&
                <Typography
                    className="grey-title"
                    variant="body1"
                    gutterBottom>{props.titleText.text}</Typography>
            }

            <Stack direction="row" spacing={2} sx={{flexWrap: 'wrap'}}>
                {
                    props.cameras.map((camera, i) => {
                        return <FormControlLabel
                            key={camera.id}
                            control={<Checkbox />}
                            label={camera.name}
                            checked={
                                props.camerasSelected.indexOf(camera.id) >= 0
                            }
                            onClick={() => toggleCamerasSelected(camera.id)}
                        />;
                    })
                }
            </Stack>
        </div>
    );
}

export default CamerasSelector;
