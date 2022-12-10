/* eslint-disable semi */
import IUpdateAction from './IUpdateAction';

export default interface IConfigurationHandler {
    /**
     * Update a field
     *
     * @param {{field: string, path: string}} path Field is the actual field that is being
     * updated and path is that field + (well, as a prefix of it) all the sections
     * needed to reach to it. example {field: 'test', path: 's1/s2/.../test'}
     *
     * @param {IUpdateAction} value
     */
    update(path: { field: string; path: string }, value: IUpdateAction): void;
}
