import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "./config";

export const middleware = (req:Request,res:Response,next:NextFunction)=>{
    const header = req.headers['authorization'];
    const decode = jwt.verify(header as string , jwtSecret);

    if(decode){
        //@ts-ignore
        req.userId = decode.id;
        next();
    }else{
        res.status(401).json({message:"You are not signed in"});
    }
}
