"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomId = void 0;
const randomId = (length) => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < 3; j++) {
            result = result + letters[Math.floor(Math.random() * letters.length)];
        }
        if (i < length - 1) {
            result += "-";
        }
    }
    return result;
};
exports.randomId = randomId;
console.log((0, exports.randomId)(3));
