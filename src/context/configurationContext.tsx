import React, { createContext } from 'react';
import { Dictionary } from 'underscore';
import IProblemJson from '../services/api/interfaces/IProblemJson';
import TypedPromise from '../TypedPromise';

export type UpdateFieldCallback = (
    path: string,
    value: any,
) => TypedPromise<any, IProblemJson>;

export type GetFieldCallback = (
    path: string,
) => TypedPromise<any, IProblemJson>;

export type GetCachedFieldCallback = (path: string) => any | undefined;

export type ConfigurationContextType = {
    params: Dictionary<any>;
    updateCB: UpdateFieldCallback;
    getFieldCB: GetFieldCallback;
    getInitialValue: GetCachedFieldCallback;
};

export const ConfigurationContext = createContext<
    ConfigurationContextType | undefined
>(undefined);

export function useConfiguration() {
    const context = React.useContext(ConfigurationContext);
    if (context === undefined) {
        throw new Error(
            'useConfiguration must be used within a ConfigurationContext',
        );
    }
    return context;
}
