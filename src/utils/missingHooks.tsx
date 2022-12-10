import React, { Component } from 'react';
import { useParams } from 'react-router';

export default function withParams<IComp extends Component<any, any>>(
    PComponent: IComp,
) {
    // eslint-disable-next-line react/display-name
    return (props: JSX.IntrinsicAttributes) => (
        <PComponent {...props} params={useParams()} />
    );
}
