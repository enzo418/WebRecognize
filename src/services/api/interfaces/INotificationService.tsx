import INotification from '../../../domain/Notification';

/**
 * Notification service interface
 *
 * @export
 * @abstract
 * @class INotificationService
 * @typedef {INotificationService}
 */
export abstract class INotificationService {
    /**
     * Get a notification
     *
     * @abstract
     * @param {string} id
     * @returns {Promise<INotification>}
     */
    abstract get(id: string): Promise<INotification>;

    /**
     * Get all the notifications
     *
     * @abstract
     * @param {number} limit max number of notifications
     * @returns {Promise<Array<INotification>>}
     */
    abstract getAll(limit: number): Promise<Array<INotification>>;

    /**
     * Get notifications before a notification (id) or
     * before a date.
     *
     * @abstract
     * @param {(string | Date)} before
     * @param {number} limit max number of notifications
     * @returns {Promise<Array<INotification>>}
     */
    abstract getBefore(
        before: string | Date,
        limit: number,
    ): Promise<Array<INotification>>;

    /**
     * Get notifications after a notification (id) or
     * after a date.
     *
     * @abstract
     * @param {(string | Date)} after
     * @param {number} limit max number of notifications
     * @returns {Promise<Array<INotification>>}
     */
    abstract getAfter(
        after: string | Date,
        limit: number,
    ): Promise<Array<INotification>>;

    /**
     * Get notifications between two notifications (id) or
     * between two dates.
     *
     * @abstract
     * @template T string or Date
     * @template U extends T - strict type to T
     * @param {T} before
     * @param {U} after
     * @param {number} limit
     * @returns {Promise<Array<INotification>>}
     */
    abstract getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number,
    ): Promise<Array<INotification>>;

    /**
     * Subscribe to new notifications.
     *
     * @abstract
     * @param {*} callback Function to call when a new notification is available.
     */
    abstract subscribe(callback: (not: INotification[]) => any): void;

    /**
     * Unsubscribe from notifications
     *
     * @abstract
     * @param {(not: INotification[]) => any} callback
     */
    abstract unsubscribe(callback: (not: INotification[]) => any): void;
}
