import  User  from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

 const   verifyjwt = asyncHandler(async (req,res,next)=>{
 try{
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        throw new ApiError(401,"Unauthoized request")
    }
    const decodetoken  = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodetoken?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"invlid accesstoken")
    }
    req.user = user;
    next()
     }
   catch(error){
    throw new ApiError(400,error?.message || "invalid accesstoken")
   } 
 })
 export default verifyjwt;