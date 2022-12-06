import {Box, Button} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {configurationService} from '../services/api/Services';
import { toast } from 'react-toastify';


export default function CreateConfigurationFromFilePage() {
    const [fileContent, setFileContent] = React.useState<string>("");

    const navigate = useNavigate();

    const ReadFile = (file: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            let content = JSON.stringify(JSON.parse((event?.target?.result) as string));
            setFileContent(content.replace(/(\r\n|\n|\r|\t)/gm, ""));
        });
        reader.readAsText(file);
    };

    const onFileChange = (event:any) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        ReadFile(event.target.files[0]);
    };

    const sendFile = () => {
        configurationService.create(fileContent)
            .ok(res => navigate("/configuration/" + res.id))
            .fail(e => {
                toast("Configuration was not added: " + (e.detail || e.title), {
                    autoClose: 5000,
                });
            });
    };

    return (
    <Box sx={{padding: '10px', height: '100vh'}} className='centered'>
        <input type="file" id="myFile" name="filename" onChange={onFileChange}></input>
        <Button 
            type="submit" 
            sx={{margin: '40px'}} 
            onClick={sendFile}>Send</Button>
    </Box>
    );
}