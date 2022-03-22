/**
 * JSON-like transfer object that the server sends to us.
 *
 * @interface DTONotification
 * @typedef {DTONotification}
 */

export default interface DTONotification {
    id: string,
    date: Date;
    group: number;
    cameraID: string;
    type: string;
    content: string;
// eslint-disable-next-line semi
};
