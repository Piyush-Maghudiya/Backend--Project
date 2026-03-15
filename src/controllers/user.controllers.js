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
    
        const {fullname,email,password ,username} = req.body || {}
        console.log("email : ",email)
        
        if(email === ""){
          throw  new ApiError(400,"email is required")
        }
        if(password === ""){
            throw new ApiError(400,"password is required")
        }
        if(username === ""){
            throw new ApiError(400,"username is required")
        }
        if(fullname === ""){
           throw  new ApiError(400,"fullname is required")
        }

        const exituser =  await User.findOne({
          $or: [{ username},{email}]
        })
        if(exituser){
          throw new ApiError(409,"username and email already exist")
        }
 
         const avatarlocalpath = req.files?.avatar?.[0]?.path;
        //  const coverImagelocalpath = req.files?.coverImage?.[0]?.path;

        let coverImagelocalpath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
          coverImagelocalpath = req.files.coverImage[0].path;
        }

         if(!avatarlocalpath){
            throw new ApiError(400,"avatar is requiired")
         }

        const avatar = await uploadoncloudinary(avatarlocalpath)
        const coverImage = await uploadoncloudinary(coverImagelocalpath)
        if(!avatar){
         throw   new ApiError(400,"avatar is required")
        }
        
     const user = await User.create({
            username:username.toLowerCase(),
            fullname,
            password,
            email,
            avatar:avatar.url,
            coverImage :coverImage?.url || "",
        })
         const createduser = await User.findById(user._id).select("-password -refreshToken")

        if(!createduser){
            throw new ApiError(500,"somthing went wrong while creatinng user")
        }

        return res.status(201).json(
             new ApiRespose(200, createduser, "user registration successfully")
        )
})

export {registerUser}