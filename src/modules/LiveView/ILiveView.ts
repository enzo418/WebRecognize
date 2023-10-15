import { ReactEventHandler } from 'react';
import IProblemJson from '../../services/api/interfaces/IProblemJson';

export default interface ILiveView {
    play(): void;
    stop(isUnmounting?: boolean): void;

    tryPictureInPicture(onClose: () => any): Promise<boolean>;
}

export interface ILiveViewProps {
    onLoad?: any;
    style?: object;
    source: {
        cameraID?: string;
        uri?: string;
        observer?: boolean;
    };
    onError: (e?: IProblemJson) => any;
    onPlaying?: () => any;
    onStopped?: () => any;
}
