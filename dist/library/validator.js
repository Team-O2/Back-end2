"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function emailValidator(str) {
    var email = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if (!email.test(str)) {
        return false;
    }
    else {
        return true;
    }
}
const validator = { emailValidator };
exports.default = validator;
//# sourceMappingURL=validator.js.map