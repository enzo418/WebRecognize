import { createContext, useContext } from 'react';

import DTOObserverStatus from '../services/api/interfaces/DTOObserverStatus';

export const ObserverStatusContext = createContext<DTOObserverStatus | null>(
    null,
);

export function useObserverStatus(): DTOObserverStatus | null {
    const status = useContext(ObserverStatusContext);
    return status;
}
