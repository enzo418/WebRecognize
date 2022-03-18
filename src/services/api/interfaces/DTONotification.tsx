/**
 * JSON-like transfer object that the server sends to us.
 *
 * @interface DTONotification
 * @typedef {DTONotification}
 */

export default interface DTONotification {
    date: Date;
    group: number;
    cameraID: string;
};
