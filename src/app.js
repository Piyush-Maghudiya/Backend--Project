import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()
app.use(express.json());
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
 app.use(express.urlencoded({extended:true,limit:"16kb"}))
 app.use(express.static("public"))
 app.use(cookieParser()) 
 
// import routes
import userRouter from "./routes/user.routes.js" 
import commentRouter from "./routes/comment.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/like.routes.js"
// route decalre
app.use("/api/v1/users",userRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/like",likeRouter)


export default app

