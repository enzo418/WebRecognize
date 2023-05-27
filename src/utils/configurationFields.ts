import TypedPromise from '../TypedPromise';
import { ConfigurationContextType } from '../context/configurationContext';
import IProblemJson from '../services/api/interfaces/IProblemJson';

export function calculateFieldPath(
    context: ConfigurationContextType,
    field: string,
) {
    const camera = context.params?.camera_id;
    const p = camera !== undefined ? `cameras/${camera}/` : '';

    return p + field;
}

export function getCachedFieldValue(
    context: ConfigurationContextType,
    field: string,
) {
    return context.getInitialValue(calculateFieldPath(context, field));
}

export function getFieldValue(
    context: ConfigurationContextType,
    field: string,
): TypedPromise<any, IProblemJson> {
    return context.getFieldCB.apply(null, [calculateFieldPath(context, field)]);
}

export function setFieldValue(
    context: ConfigurationContextType,
    field: string,
    value: any,
): TypedPromise<any, IProblemJson> {
    return context.updateCB.apply(null, [
        calculateFieldPath(context, field),
        value,
    ]);
}
