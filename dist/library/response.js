"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basicResponse = (res, status, message) => {
    res.status(status).json({
        status: status,
        message: message,
    });
};
const dataResponse = (res, status, message, data) => {
    res.status(status).json({
        status: status,
        message: message,
        data: data,
    });
};
const tokenResponse = (res, status, message, token) => {
    res.status(status).json({
        status: status,
        message: message,
        token: token,
    });
};
const dataTokenResponse = (res, status, message, data, token) => {
    res.status(status).json({
        status: status,
        message: message,
        data: data,
        token: token,
    });
};
const responseTypes = {
    basicResponse,
    dataResponse,
    tokenResponse,
    dataTokenResponse,
};
exports.default = responseTypes;
//# sourceMappingURL=response.js.map