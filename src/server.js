import net from 'net';
import {parseHeader} from './protocol.js';
import {fetch, supportedApiKeys} from './handlers.js';


function handleData(socket, buffer) {
    let data = Buffer.alloc(0); // Use Buffer.alloc for an empty buffer
    data = Buffer.concat([data, buffer]);

    while (data.length > 0) {
        if (data.length < 4) return; // Wait until we have at least 4 bytes (message length)
        const len = ntohl(data.slice(0, 4)); // Extract length from the first 4 bytes
        if (data.length < len + 4) return; // Wait until we have the entire message

        // Extract the packet and update data buffer
        const pkt = data.slice(4, len + 4);
        data = data.slice(len + 4);

        const header = parseHeader(pkt);
        let responseData;

        if (header.request_api_key === 18) {
            responseData = supportedApiKeys(header);
        } else if (header.request_api_key === 1) {
            responseData = fetch(header); // Adjust fetch to handle `header` if needed
        } else {
            responseData = [0, 43]; // Unsupported API key
        }

        // Construct the response
        const response = Buffer.concat([
            Buffer.from([0, 0, 0, responseData.length + 4]), // Message length
            header.correlation_id, // Correlation ID
            Buffer.from(responseData) // Response data
        ]);

        socket.write(response);
    }
}

function ntohl(data, offset = 0) {
    return (
        (data[offset + 0] << 24) +
        (data[offset + 1] << 16) +
        (data[offset + 2] << 8) +
        (data[offset + 3] << 0)
    );
}

const server = net.createServer((socket) => {
    socket.on('data', (buffer) => {
        handleData(socket, buffer);
    });
});

server.listen(9092, '127.0.0.1');
console.log('Server is listening on port 9092');
