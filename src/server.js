import net from "net";
import {createResponseBuffer, readInt32} from "./kafka-protocal.js";
import {SERVER_CONFIG} from "./config.js";

const server = net.createServer((connection) => {
    console.log("Client connected");

    connection.on("data", (data) => {
        const messageLength = readInt32(data, 0);
        console.log(`Message length: ${messageLength}`);

        const clientCorrelationId = readInt32(data, 4);
        console.log(`Client Correlation ID: ${clientCorrelationId}`);

        const responseBuffer = createResponseBuffer(7);  // Hardcoded correlation ID
        connection.write(responseBuffer);
        console.log("Response sent.");
    });

    connection.on("end", () => {
        console.log("Client disconnected");
    });
});

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
    console.log(`Kafka-like server listening on ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
});
