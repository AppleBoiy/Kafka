import net from "net";
import {createResponseBuffer, readInt32} from './kafka-protocol.js';
import {SERVER_CONFIG} from './config.js';

// Helper function to parse the request header (v2)
function parseRequestHeader(buffer) {
    let offset = 0;

    const messageLength = readInt32(buffer, offset); // First 4 bytes: message length
    offset += 4;

    const requestApiKey = buffer.readInt16BE(offset); // Next 2 bytes: request API key
    offset += 2;

    const requestApiVersion = buffer.readInt16BE(offset); // Next 2 bytes: request API version
    offset += 2;

    const correlationId = readInt32(buffer, offset); // Next 4 bytes: correlation ID
    offset += 4;

    // For now, we can skip the Client ID and Tagged Fields
    return {
        messageLength,
        requestApiKey,
        requestApiVersion,
        correlationId,
    };
}

const server = net.createServer((connection) => {
    console.log("Client connected");

    connection.on("data", (data) => {
        // Parse the request header (extract correlation ID)
        const requestHeader = parseRequestHeader(data);
        console.log(`Received request with correlation ID: ${requestHeader.correlationId}`);

        // Create the response with the same correlation ID
        const responseBuffer = createResponseBuffer(requestHeader.correlationId);
        connection.write(responseBuffer);
        console.log(`Sent response with correlation ID: ${requestHeader.correlationId}`);
    });

    connection.on("end", () => {
        console.log("Client disconnected");
    });
});

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
    console.log(`Kafka-like server listening on ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
});
