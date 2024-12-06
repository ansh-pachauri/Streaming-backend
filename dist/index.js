"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const db_1 = __importStar(require("./db"));
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const random_1 = require("./random");
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
        }, config_1.jwtSecret);
        res.status(200).json({ token });
        console.log(token);
    }
    else {
        res.status(401).json({ message: "Invalid username or password" });
    }
}));
//session route
app.post("/api/v1/session", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const title = req.body.title;
    const status = req.body.status;
    const sessionId = (0, random_1.randomId)(3);
    const session = yield db_1.SessionModel.create({
        title,
        status,
        sessionId,
        //@ts-ignore
        userId: req.userId,
    });
    if (session) {
        res.status(200).json({ message: "Session created successfully",
            "sessionId": sessionId });
    }
    else {
        res.status(400).json({ message: "Invalid session data" });
    }
}));
//get session route
app.get("/api/v1/session", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all sessions for the current logged in user
    const sessions = yield db_1.SessionModel.find({
        //@ts-ignore
        userId: req.userId
    }).populate('userId'); // This will populate the user details
    res.status(200).json({
        sessions
    });
}));
// If you want to get a specific session by sessionId:
app.get("/api/v1/session/:sessionId", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const session = yield db_1.SessionModel.findOne({
        sessionId: sessionId,
        //@ts-ignore
        userId: req.userId
    }).populate('userId');
    if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
    }
    res.status(200).json({
        session
    });
}));
//start session route
app.post("/api/v1/session/:sessionId/start", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const session = yield db_1.SessionModel.findOne({
        sessionId: sessionId,
        //@ts-ignore
        userId: req.userId
    });
    if (!session) {
        res.status(404).json({
            message: "Session not found"
        });
        return;
    }
    if (session.status === "active") {
        res.status(400).json({
            message: "Session already started"
        });
        return;
    }
    // Update session status to active
    yield db_1.SessionModel.updateOne({ sessionId }, { $set: { status: "active" } });
    res.status(200).json({
        message: "Session started successfully"
    });
}));
//stop session route
app.post("/api/v1/session/:sessionId/end", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const session = yield db_1.SessionModel.findOne({
        sessionId: sessionId,
        //@ts-ignore
        userId: req.userId
    });
    if (!session) {
        res.status(404).json({
            message: "Session does not exist"
        });
        return;
    }
    if (session.status === "inactive") {
        res.status(400).json({
            message: "Session already ended"
        });
        return;
    }
    // Update session status to ended
    yield db_1.SessionModel.updateOne({ sessionId }, { $set: { status: "inactive" } });
    res.status(200).json({
        message: "Session ended successfully"
    });
}));
//adding slides route
app.post("/api/v1/session/:sessionId/slides", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.params;
    const session = yield db_1.SessionModel.findOne({
        sessionId: sessionId,
        //@ts-ignore
        userId: req.userId
    });
    const imageUrl = req.body.imageUrl;
    if (session) {
        res.status(200).json({
            message: "Empty slides added successfully",
            slides: [{
                    type: "image",
                    payload: {
                        imageUrl: imageUrl
                    }
                }]
        });
    }
    else {
        res.status(404).json({
            message: "Session not found"
        });
    }
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
