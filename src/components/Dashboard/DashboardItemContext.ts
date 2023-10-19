import { createContext } from 'react';

export interface DashboardItemContextType {
    width: number;
}

export const DashboardItemContext = createContext<DashboardItemContextType>({
    width: 0,
});
