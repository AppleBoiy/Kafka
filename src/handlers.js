function supportedApiKeys(header) {
    const apiKeys = [
        {apiKey: 18, version: 4}, // apiversions
        {apiKey: 1, version: 16}  // fetch
    ];

    const supportedVersions = [0, 1, 2, 3, 4];

    if (!supportedVersions.includes(header.request_api_version)) {
        return [0, 35]; // Unsupported version
    }

    // Construct response
    const response = [
        0, // Error code
        0, // No error
        apiKeys.length + 1, // Number of API keys plus one
        ...apiKeys.flatMap(({apiKey, version}) => [
            0, // Placeholder for unknown field
            apiKey, // API key
            0, // Placeholder
            version, // Min version
            0, // Placeholder
            version, // Max version
            0 // Placeholder
        ]),
        0, // Placeholder
        0, // Placeholder
        0, // Placeholder
        0, // Throttle time
        0 // Tagged
    ];

    return response;
}

function fetch(header) {
    const throttleTimeMs = Buffer.from([0, 0, 0, 0]); // 4 bytes
    const errorCode = Buffer.from([0, 0]); // 2 bytes
    const sessionId = Buffer.from([0, 0, 0, 0]); // 4 bytes
    const responsesLen = Buffer.from([0]); // 1 byte
    const tagBuffer = Buffer.from([0]); // 1 byte

    const result = Buffer.concat([
        Buffer.from([0]), // tag buffer?
        throttleTimeMs,
        errorCode,
        sessionId,
        responsesLen,
        tagBuffer,
    ]);

    return result;
}

export {supportedApiKeys, fetch};
