function ntohl(data, offset = 0) {
    return (
        (data[offset + 0] << 24) +
        (data[offset + 1] << 16) +
        (data[offset + 2] << 8) +
        (data[offset + 3] << 0)
    );
}

function ntohs(data, offset = 0) {
    return (data[offset] << 8) + data[offset + 1];
}

function parseHeader(data) {
    let client_id_end;
    for (client_id_end = 8; client_id_end < data.length && data[client_id_end] !== 0; client_id_end++) ;

    const client_id = data.slice(9, client_id_end);

    return {
        request_api_key: ntohs(data, 0),
        request_api_version: ntohs(data, 2),
        correlation_id: data.slice(4, 8),
        client_id,
    };
}

export {ntohl, ntohs, parseHeader};
