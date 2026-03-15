import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import uploadoncloudinary from "../utils/cloudinary.js"
import ApiRespose from "../utils/ApiResponse.js" 
const registerUser = asyncHandler(async (req,res) =>{
    //  take user data 
    // userr data validate
    // check user is alredy login
    // check  image and avatar
    // check image upload on cloudinary
    //  create object and entry in database
    //  remove password and refresh token from  response
    // check user creation
    // return response

        const {fullname,email,password ,username} = req.body
        console.log("email : ",email)
        
        if(email === ""){
            new ApiError(400,"email is required")
        }
        if(password === ""){
            new ApiError(400,"password is required")
        }
        if(username === ""){
            new ApiError(400,"username is required")
        }
        if(fullname === ""){
            new ApiError(400,"fullname is required")
        }

        const exituser = User.findOne({
          $or: [{ username},{email}]
        })
        if(exituser){
          new ApiError(409,"username and email already exist")
        }
 
         const avatarlocalpath = req.files?.avatar[0]?.passwordath;
         const coverImagetlocalpath = req.files?.coverImage[0]?.path;

         if(!avatarlocalpath){
           new ApiError(400,"avatar is requiired")
         }

        const avatar = await uploadoncloudinary(avatarlocalpath)
        const coverImage = await uploadoncloudinary(coverImagetlocalpath)
        if(!avatar){
           new ApiError(400,"avatar is required")
        }
        
     const user = await User.create({
            username:username.toLowerCase(),
            fullname,
            password,
            email,
            avatar:avatar.url,
            coverImage :coverImage?.url || "",
        })
         const createduser = User.findById(user._id).select("-password -refreshToken")

        if(!createduser){
            throw new ApiError(500,"somthing went wrong while creatinng user")
        }

        return res.status(201).json(
             new ApiRespose(200,"user registration successfully")
        )
})

export {registerUser}