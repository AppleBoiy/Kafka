import net from 'net';
import {parseHeader} from './protocol.js';
import {fetch, supportedApiKeys} from './handlers.js';

function handleData(socket, buffer, bufferState) {
    bufferState.data = Buffer.concat([bufferState.data, buffer]);

    while (bufferState.data.length >= 4) {
        const len = ntohl(bufferState.data.slice(0, 4));
        if (bufferState.data.length < len + 4) return; // Wait for the entire message

        const pkt = bufferState.data.slice(4, len + 4);
        bufferState.data = bufferState.data.slice(len + 4); // Remove the processed part

        const [header, body] = parseHeader(pkt);
        let responseData;

        try {
            if (header.request_api_key === 18) {
                responseData = supportedApiKeys(header);
            } else if (header.request_api_key === 1) {
                responseData = fetch(header, body);
            } else {
                responseData = [0, 35]; // Unsupported API key, use error code 35
            }

            const response = Buffer.concat([
                Buffer.from([0, 0, 0, responseData.length + 4]), // Message length
                header.correlation_id, // Correlation ID
                Buffer.from(responseData) // Response data
            ]);

            socket.write(response);
        } catch (err) {
            console.error('Error handling request:', err);
            socket.destroy(); // Close the connection on error
        }
    }
}

function ntohl(buffer) {
    return buffer.readUInt32BE(0); // Read 4-byte unsigned int in Big Endian
}

const server = net.createServer((socket) => {
    const bufferState = {data: Buffer.alloc(0)}; // Store buffer state for this socket

    socket.on('data', (buffer) => {
        handleData(socket, buffer, bufferState);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(9092, '127.0.0.1', () => {
    console.log('Server is listening on port 9092');
});
