import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    Credentials:true
}))

app.use(express.json({limit:"16kb"}))
 app.use(express.urlencoded({extended:true,limit:"16kb"}))
 app.use(express.static("public"))
 app.use(cookieParser()) 
 
// import routes
import userRouter from "./routes/user.routes.js" 


// route decalre
app.use("/api/v1/users",userRouter)



export default app

