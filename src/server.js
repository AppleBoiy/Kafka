import net from 'net';

function ntohl(data, offset = 0) {
    return (data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
}

function ntohs(data, offset = 0) {
    return (data[offset] << 8) | data[offset + 1];
}

function parseHeader(data) {
    let clientIdEnd = 8;
    while (clientIdEnd < data.length && data[clientIdEnd] !== 0) {
        clientIdEnd++;
    }

    const clientId = data.slice(8, clientIdEnd).toString('utf8');
    return {
        requestApiKey: ntohs(data, 0),
        requestApiVersion: ntohs(data, 2),
        correlationId: data.slice(4, 8),
        clientId,
    };
}

function createResponse() {
    const apiKeys = [
        {apiKey: 18, version: 4}, // metadata
        {apiKey: 1, version: 16}, // produce
    ];

    const ERROR_CODE_SIZE = 2;
    const NUMBER_OF_VERSIONS_SIZE = 1;
    const API_KEY_SIZE = 2;
    const VERSION_SIZE = 2;
    const THROTTLE_TIME_SIZE = 4;
    const NUMBER_OF_TOPICS_SIZE = 1;

    const bufferSize = ERROR_CODE_SIZE
        + NUMBER_OF_VERSIONS_SIZE
        + apiKeys.length * (API_KEY_SIZE + VERSION_SIZE * 2 + 1)
        + THROTTLE_TIME_SIZE
        + NUMBER_OF_TOPICS_SIZE;

    const buffer = Buffer.alloc(bufferSize);

    buffer.writeUInt16BE(0, 0); // error code (0 = NO_ERROR)
    buffer.writeUInt8(apiKeys.length + 1, ERROR_CODE_SIZE); // number of versions

    // Write each API key and version
    let offset = ERROR_CODE_SIZE + NUMBER_OF_VERSIONS_SIZE;
    apiKeys.forEach(({apiKey, version}) => {
        buffer.writeUInt16BE(apiKey, offset);
        buffer.writeUInt16BE(version, offset + API_KEY_SIZE);
        buffer.writeUInt16BE(version, offset + API_KEY_SIZE + VERSION_SIZE);
        buffer.writeUInt8(0, offset + API_KEY_SIZE + VERSION_SIZE * 2);
        offset += API_KEY_SIZE + VERSION_SIZE * 2 + 1;
    });

    buffer.writeUInt32BE(0, offset); // throttle time
    buffer.writeUInt8(0, offset + THROTTLE_TIME_SIZE); // number of topics

    return buffer;
}


async function kafkaServer(socket) {
    let dataBuffer = Buffer.alloc(0);

    function processData(buffer) {
        dataBuffer = Buffer.concat([dataBuffer, buffer]);

        while (dataBuffer.length >= 4) {
            const length = ntohl(dataBuffer);
            if (dataBuffer.length < length + 4) return;

            const packet = dataBuffer.slice(4, length + 4);
            dataBuffer = dataBuffer.slice(length + 4);

            const header = parseHeader(packet);

            if (![0, 1, 2, 3, 4].includes(header.requestApiVersion)) {
                const errorResponse = Buffer.concat([
                    Buffer.from([0, 0, 0, 6]), // Length (6 bytes)
                    header.correlationId,
                    Buffer.from([0, 35]), // Error code (35 = UNSUPPORTED_VERSION)
                ]);
                socket.write(errorResponse);
            } else {
                const responseData = createResponse();

                const response = Buffer.concat([
                    Buffer.from([0, 0, 0, responseData.length + 4]), // Length
                    header.correlationId,
                    responseData,
                ]);
                socket.write(response);
            }
        }
    }

    socket.on('data', processData);
}

function startServer() {
    const server = net.createServer(kafkaServer);
    server.listen(9092, '127.0.0.1', () => {
        console.log('Server listening on port 9092');
    });
}

startServer();
