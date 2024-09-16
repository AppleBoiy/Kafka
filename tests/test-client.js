import net from "net";

const testClient = net.createConnection({port: 9092, host: "127.0.0.1"}, () => {
    console.log("Connected to server");

    const requestBuffer = Buffer.alloc(8); // Message length + correlation ID
    requestBuffer.writeInt32BE(8, 0);  // Message length: 8 bytes (just as an example)
    requestBuffer.writeInt32BE(6789, 4);  // Client's correlation ID

    testClient.write(requestBuffer);  // Send the request
});

testClient.on("data", (data) => {
    console.log(`Received response: ${data.toString('hex')}`);
    testClient.end();
});

testClient.on("end", () => {
    console.log("Disconnected from server");
});

testClient.on("error", (err) => {
    console.error("Error: ", err);
});
