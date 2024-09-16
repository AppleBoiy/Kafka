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
                const responseData = Buffer.from([
                    0, 0, // Error code
                    2, // API keys length + 1
                    0, // Reserved
                    18, // API key
                    0, 4, // Min version
                    0, 4, // Max version
                    0, 0, 0, 0, 0, // Throttle time
                    0, // Reserved (not documented)
                ]);

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
