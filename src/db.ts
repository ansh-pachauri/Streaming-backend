import mongoose from "mongoose";

mongoose.connect("mongodb+srv://pachauriansh15:IhSb9GfAw7i84dL4@cluster0.zbeij.mongodb.net/sessoion-db");

const UserSchema = new mongoose.Schema({
    username: {type:String, required:true, unique:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    createdAt: {type:Date, default:Date.now},
})

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;

const SessionSchema = new mongoose.Schema({
    title: {type:String, required:true},
    createdAt: {type:Date, default:Date.now},
    sessionId: {type:String, required:true, unique:true},
    userId: {type: mongoose.Types.ObjectId, ref: "User", required:true},
    status: {type:String, enum:["active", "inactive"], default:"inactive"},
})

const SessionModel = mongoose.model("Session", SessionSchema);

export {SessionModel};
