export function writeErrorCode(connection, errorCode) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(errorCode);
    connection.write(buffer);
}
