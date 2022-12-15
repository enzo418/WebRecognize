import { Box, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { configurationService } from '../services/api/Services';
import { toast } from 'react-toastify';

export default function CreateConfigurationFromFilePage() {
    const navigate = useNavigate();

    const onFileChange = (event: any) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.addEventListener('load', event => {
            let content = JSON.stringify(
                JSON.parse(event?.target?.result as string),
            );

            content = content.replace(/(\r\n|\n|\r|\t)/gm, '');

            sendFile(content);
        });

        reader.readAsText(file);
    };

    const sendFile = (fileContent: string) => {
        configurationService
            .create(fileContent)
            .ok(res => navigate('/configuration/' + res.id + '/general/basics'))
            .fail(e => {
                const extraMessage =
                    e.status == 0
                        ? 'check that the server is running'
                        : 'try again';

                toast.error(
                    `Configuration was not added, ${extraMessage} \nDetail: ${
                        e.detail || e.title
                    }`,
                    {
                        autoClose: 5000,
                    },
                );
            });
    };

    return (
        <Box sx={{ padding: '10px', height: '100vh' }} className="centered">
            <input
                type="file"
                id="myFile"
                name="filename"
                onChange={onFileChange}></input>
        </Box>
    );
}
