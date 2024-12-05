import express from "express";
import { Request, Response, } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import UserModel from "./db";

const jwtSecret = "allthrocin25";
const app = express();
app.use(express.json());

//routes
//signup route
app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const requirebody = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(3).max(20),
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
    const user = await UserModel.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({ message: "User created successfully" });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//signin route
app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const username = req.body.username;
  const password = req.body.password;

  const exist = await UserModel.findOne({ username, password });
  if (exist) {
    const token = jwt.sign({
      id: exist._id,
    }, jwtSecret);
    res.status(200).json({ token });
    console.log(token);
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
