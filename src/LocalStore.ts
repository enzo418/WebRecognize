import DTOVideoBuffer from './services/api/interfaces/DTOVideoBuffer';

export enum Key {
    LAST_DEBUG_BUFFER = 'LAST_DEBUG_BUFFER',
    LAST_CAMERA_CONFIGURATION_ID = 'LAST_CAMERA_CONFIGURATION_ID',
    LAST_CONFIGURATION_ID = 'LAST_CONFIGURATION_ID',
    LAST_CONFIGURATION_EXECUTED_ID = 'LAST_CONFIGURATION_EXECUTED_ID',
    THEME_MODE = 'THEME_MODE',
    NOTIFICATION_VOLUME = 'NOTIFICATION_VOLUME',
    DEFAULT_SHOW_LIVE_VIEW = 'DEFAULT_SHOW_LIVE_VIEW',
}

export function saveLocal<T>(key: Key, value: T) {
    let parsedValue: string;

    switch (typeof value) {
        case 'number':
            parsedValue = value.toString();
            break;
        case 'boolean':
            parsedValue = value.toString();
            break;
        default:
            parsedValue = JSON.stringify(value);
            break;
    }

    localStorage.setItem(key.toString(), parsedValue);
}

export function getLocal(key: Key): string | null {
    return localStorage.getItem(key.toString());
}

export function getLocalDefault<T>(key: Key, defaultValue: T): T {
    const v = localStorage.getItem(key.toString());

    if (v === null) {
        return defaultValue;
    } else if (typeof defaultValue === 'number') {
        const parsedValue = parseFloat(v);
        return (isNaN(parsedValue) ? defaultValue : parsedValue) as T;
    } else if (typeof defaultValue === 'boolean') {
        if (v.toLowerCase() === 'true') {
            return true as T;
        } else if (v.toLowerCase() === 'false') {
            return false as T;
        } else {
            return defaultValue;
        }
    }

    return defaultValue;
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
