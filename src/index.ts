import express from "express";
import { Request, Response, } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import UserModel, { SessionModel } from "./db";
import { jwtSecret } from "./config";
import { middleware } from "./middleware";
import { randomId } from "./random";
import multer from "multer";
// import {fromPath} from "pdf2pic";
// import cloudinary from "./cloudinary";
import {wss} from "./sockets";

wss.on("connection",()=>{
    console.log("New connection");
})  




const app = express();

// const upload = multer({dest:"uploads/"});

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

//session route

app.post("/api/v1/session",middleware,async(req:Request,res:Response)=>{
  const title = req.body.title;
  const status = req.body.status;

  const sessionId = randomId(3);


  const session = await SessionModel.create({
    title,
    status,
    sessionId,
    //@ts-ignore
    userId:req.userId,
  });

  if(session){
    res.status(200).json({message:"Session created successfully",
      "sessionId":sessionId});
  }else{
    res.status(400).json({message:"Invalid session data"});
  }

})

//get session route
app.get("/api/v1/session", middleware, async (req: Request, res: Response) => {
  // Get all sessions for the current logged in user
  const sessions = await SessionModel.find({
    //@ts-ignore
    userId: req.userId
  }).populate('userId');  // This will populate the user details

  res.status(200).json({
    sessions
  });
});

// If you want to get a specific session by sessionId:
app.get("/api/v1/session/:sessionId", middleware, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  const session = await SessionModel.findOne({
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
});

//start session route
app.post("/api/v1/session/:sessionId/start", middleware, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = await SessionModel.findOne({
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
  await SessionModel.updateOne(
    { sessionId },
    { $set: { status: "active" } }
  );

  res.status(200).json({
    message: "Session started successfully"
  });
});

//stop session route
app.post("/api/v1/session/:sessionId/end", middleware, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = await SessionModel.findOne({
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
  await SessionModel.updateOne(
    { sessionId },
    { $set: { status: "inactive" } }
  );

  res.status(200).json({
    message: "Session ended successfully"
  });
});


//adding slides route
app.post("/api/v1/session/:sessionId/slides",middleware,async(req:Request,res:Response)=>{
  const {sessionId} = req.params;
  const session = await SessionModel.findOne({
    sessionId:sessionId,
    //@ts-ignore
    userId:req.userId
  })  

  const imageUrl = req.body.imageUrl;
  if(session){
    res.status(200).json({
      message:"Empty slides added successfully",
      slides:[{
        type:"image",
        payload:{
          imageUrl : imageUrl
        }
      }]

    })
  }else{
    res.status(404).json({
      message:"Session not found"
    })
  }
})


// const uploadPdf = upload.single("pdf");
// const sessions = {};

//adding the pdf route
// app.post("/api/v1/session/:sessionId/slides/pdf",uploadPdf,middleware,async(req:Request,res:Response)=>{
//   const {sessionId} = req.params;
//   const session = await SessionModel.findOne({
//     sessionId:sessionId,
//     //@ts-ignore
//     userId:req.userId
//   })
  
//   const pdfPath = req.file?.path; //path of the pdf file

  
//   else{
//     res.status(404).json({
//       message:"Session not found"
//     })
//   }
// })


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
