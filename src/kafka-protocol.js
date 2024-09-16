export function readInt32(buffer, offset) {
    return buffer.readInt32BE(offset);
}

export function writeInt32(buffer, offset, value) {
    buffer.writeInt32BE(value, offset);
}

export function createResponseBuffer(correlationId) {
    const responseBuffer = Buffer.alloc(8);
    writeInt32(responseBuffer, 0, 4);           // 4 bytes for the message length
    writeInt32(responseBuffer, 4, correlationId);  // Correlation ID
    return responseBuffer;
}
