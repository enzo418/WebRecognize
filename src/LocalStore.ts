import DTOVideoBuffer from './services/api/interfaces/DTOVideoBuffer';

export enum Key {
    LAST_DEBUG_BUFFER = 'LAST_DEBUG_BUFFER',
    LAST_CAMERA_CONFIGURATION_ID = 'LAST_CAMERA_CONFIGURATION_ID',
    LAST_CONFIGURATION_ID = 'LAST_CONFIGURATION_ID',
    LAST_CONFIGURATION_EXECUTED_ID = 'LAST_CONFIGURATION_EXECUTED_ID',
    THEME_MODE = 'THEME_MODE',
}

export function saveLocal(key: Key, value: string) {
    localStorage.setItem(key.toString(), value);
}

export function getLocal(key: Key): string | null {
    return localStorage.getItem(key.toString());
}

export function getLocalDefault<T>(key: Key, defaultValue: T): string | T {
    const v = localStorage.getItem(key.toString());

    return v === null ? defaultValue : v;
}

export function removeLocal(key: Key): void {
    return localStorage.removeItem(key.toString());
}

/* --------------------- FOR OBJECTS -------------------- */
interface KeyTypeMap {
    [Key.LAST_DEBUG_BUFFER]: DTOVideoBuffer;
}

export function saveLocalObject(
    key: keyof KeyTypeMap,
    value: KeyTypeMap[typeof key],
) {
    localStorage.setItem(key.toString(), JSON.stringify(value));
}

export function getLocalObject(
    key: keyof KeyTypeMap,
): KeyTypeMap[typeof key] | null {
    const stored = localStorage.getItem(key.toString());
    return stored !== null ? JSON.parse(stored) : null;
}
