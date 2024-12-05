"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const db_1 = __importDefault(require("./db"));
const jwtSecret = "allthrocin25";
const app = (0, express_1.default)();
app.use(express_1.default.json());
//routes
//signup route
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requirebody = zod_1.z.object({
        username: zod_1.z.string().min(3).max(20),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(3).max(20),
    });
    const parsebody = requirebody.safeParse(req.body);
    if (!parsebody.success) {
        res.status(400).json({ message: "Invalid request body" });
        return;
    }
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = yield db_1.default.create({
            username,
            email,
            password,
        });
        if (user) {
            res.status(201).json({ message: "User created successfully" });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}));
//signin route
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const exist = yield db_1.default.findOne({ username, password });
    if (exist) {
        const token = jsonwebtoken_1.default.sign({
            id: exist._id,
        }, jwtSecret);
        res.status(200).json({ token });
        console.log(token);
    }
    else {
        res.status(401).json({ message: "Invalid username or password" });
    }
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
