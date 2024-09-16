import {writeErrorCode} from './utils.js';
import {ERROR_CODES, SUPPORTED_API_VERSIONS} from "./errorCodes.js";

export function handleData(data, connection) {
    const requestApiVersion = data.slice(2, 4);
    const requestCorrelationId = data.slice(4, 12);

    if (SUPPORTED_API_VERSIONS.includes(requestApiVersion.readUInt16BE(0))) {
        connection.write(requestCorrelationId);
    } else {
        connection.write(requestCorrelationId);
        writeErrorCode(connection, ERROR_CODES.UNSUPPORTED_VERSION);
    }
}
