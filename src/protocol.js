function ntohs(data, offset = 0) {
    return (data[offset] << 8) + data[offset + 1];
}

export function parseHeader(data) {
    const client_id_len = ntohs(data, 8);
    const client_id = Uint8Array.prototype.slice
        .call(data, 10, 10 + client_id_len)
        .toString();
    const tagged_fields_start = 10 + client_id_len;
    return [
        {
            request_api_key: ntohs(data, 0),
            request_api_version: ntohs(data, 2),
            correlation_id: Uint8Array.prototype.slice.call(data, 4, 8),
            client_id,
        },
        Uint8Array.prototype.slice.call(data, tagged_fields_start + 1),
    ];
}