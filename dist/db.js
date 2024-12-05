"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect("mongodb+srv://pachauriansh15:IhSb9GfAw7i84dL4@cluster0.zbeij.mongodb.net/sessoion-db");
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
const SessionSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
});
const SessionModel = mongoose_1.default.model("Session", SessionSchema);
exports.SessionModel = SessionModel;
