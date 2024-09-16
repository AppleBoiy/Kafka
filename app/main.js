import net from "net";

const server = net.createServer((connection) => {
    console.log("Client connected");

    connection.on("end", () => {
        console.log("Client disconnected");
    });

    connection.write("Hello World!\r\n");
    connection.pipe(connection);
});

server.listen(9092, "127.0.0.1");
