const UNSUPPORTED_VERSION_ERROR = 35;
const NO_ERROR = 0;

function supportedApiKeys(header) {
    const apiKeys = [
        {apiKey: 18, version: 4}, // APIVersions
        {apiKey: 1, version: 16}  // Fetch
    ];

    const supportedVersions = [0, 1, 2, 3, 4];

    if (!supportedVersions.includes(header.request_api_version)) {
        return [NO_ERROR, UNSUPPORTED_VERSION_ERROR]; // Unsupported version
    }

    // Construct response
    const response = [
        NO_ERROR, // Error code
        NO_ERROR, // Throttle time
        apiKeys.length + 1, // Number of API keys
        ...apiKeys.flatMap(({apiKey, version}) => [
            0,          // Placeholder for unknown field
            apiKey,     // API key
            0,          // Placeholder for min version
            version,    // Min version
            0,          // Placeholder for max version
            version,    // Max version
            0           // Placeholder
        ]),
        0, 0, 0, 0,  // Throttle time (4 bytes)
        0            // TAG_BUFFER
    ];

    return response;
}

function fetch(header, data) {
    if (header.request_api_key === 16) return [0, UNSUPPORTED_VERSION_ERROR];

    let pos = 21;
    let ntopics = data[pos++] - 1;
    const topics = [];
    for (let i = 0; i < ntopics; i++) {
        const topic_id = Uint8Array.prototype.slice.call(data, pos, pos + 16);
        pos += 16;
        const npartitions = data[pos++] - 1;
        pos += (4 * 4 + 2 * 8) * (data[pos] + 1);
        topics.push({topic_id, npartitions});

    }
    return [
        0,                 // Tag buffer
        [0, 0, 0, 0],      // Throttle time
        [NO_ERROR, 0],     // Error code
        [0, 0, 0, 0],      // Session ID
        [ntopics + 1],     // Responses len
        topics.map(({topic_id, npartitions}) => [
            ...topic_id,
            npartitions + 1,
            [
                [0, 0, 0, 0],
                [0, 100],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                0,
                [0, 0, 0, 0],
                0,
                0,
            ],
            0,
        ]),
        0,
    ].flat(Infinity);
}

export {supportedApiKeys, fetch};
