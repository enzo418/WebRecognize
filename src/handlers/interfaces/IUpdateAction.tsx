/* eslint-disable semi */

import IConfigurationFieldHandler from './IConfigurationFieldHandler';

export default interface IUpdateAction {
    fieldService: IConfigurationFieldHandler,
    value: any
};
