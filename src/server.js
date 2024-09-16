import net from 'net';
import {handleData} from "./apiVersionHandler.js";

const server = net.createServer((connection) => {
    connection.on('data', (data) => {
        handleData(data, connection);
    });
});

server.listen(9092, '127.0.0.1', () => {
    console.log('Server listening on port 9092');
});
