import Notification from '../../../domain/Notification';
import TypedPromise from '../../../TypedPromise';
import IProblemJson from './IProblemJson';

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
    abstract get(id: string): TypedPromise<Notification, IProblemJson>;

    /**
     * Get all the notifications
     *
     * @abstract
     * @param {number} limit max number of notifications
     * @param {number} page page number
     * @returns {TypedPromise<Array<Notification>, IProblemJson>}
     */
    abstract getAll(
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson>;

    /**
     * Get notifications before a notification (id) or
     * before a date.
     *
     * @abstract
     * @param {(string | Date)} before
     * @param {number} limit max number of notifications
     * @param {number} page page number
     * @returns {TypedPromise<Array<Notification>, IProblemJson>}
     */
    abstract getBefore(
        before: string | Date,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson>;

    /**
     * Get notifications after a notification (id) or
     * after a date.
     *
     * @abstract
     * @param {(string | Date)} after
     * @param {number} limit max number of notifications
     * @param {number} page page number
     * @returns {TypedPromise<Array<Notification>, IProblemJson>}
     */
    abstract getAfter(
        after: string | Date,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson>;

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
     * @param {number} page page number
     * @returns {TypedPromise<Array<Notification>, IProblemJson>}
     */
    abstract getBetween<T, U extends T>(
        before: T,
        after: U,
        limit: number,
        page: number,
    ): TypedPromise<Array<Notification>, IProblemJson>;

    /**
     * Subscribe to new notifications.
     *
     * @abstract
     * @param {*} callback Function to call when a new notification is available.
     */
    abstract subscribe(callback: (not: Notification[]) => any): void;

    /**
     * Unsubscribe from notifications
     *
     * @abstract
     * @param {(not: Notification[]) => any} callback
     */
    abstract unsubscribe(callback: (not: Notification[]) => any): void;

    abstract getNotificationDebugBuffer(
        groupID: number,
    ): TypedPromise<
        { reclaimed: boolean; videoBufferID?: string },
        IProblemJson
    >;

    abstract tryCreateDebugBuffer(
        groupID: number,
    ): TypedPromise<{ videoBufferID: string }, IProblemJson>;
}
