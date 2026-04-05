import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import  User  from "../models/user.models.js"
import uploadoncloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccesstokenAndRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong when generating refresh and access tokens");
  }
}
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
        
        if(!fullname || !email || !password || !username){
          throw new ApiError(400, "All fields are required (fullname, email, password, username)")
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
             new ApiResponse(200, createduser, "user registration successfully")
        )
})


  const loginUser = asyncHandler( async (req,res)=>{
      // data from req -> body
      // user login eamil,username
      // find user
      // password check 
      // access and refresh token generate
      console.log(req.body);
      const  {username,email,password} = req.body
      if(!username && !email ){
        throw new ApiError(404,"username or email required")
      }
       const user = await User.findOne({
        $or: [{ username }, { email }]
      });
      if(!user){
        throw new ApiError(400,"user not found")
      }
      const passwordvalid = await user.passwordcorrect(password)
      if(!passwordvalid){
         throw new ApiError(401,"Password is invalid,enter corret password")
      }
      const {accessToken,refreshToken} =  await generateAccesstokenAndRefreshtoken(user._id)
      const logginuser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
        httpOnly  :true,
        secure : true
      }

      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: logginuser,
              accessToken,
              refreshToken
            },
            "user login successfully"
          )
        )
  })
  
  const logoutUser = asyncHandler( async (req,res) =>{
      await User.findByIdAndUpdate(req.user._id,{
        $set :{
          refreshToken:undefined
        } 
      }, 
      {
         new :true
      }

    )
    const options = {
      httpOnly:true,
      secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"))
  }) 

  const refreshAccessToken = asyncHandler(async (req,res)=>{
     const incomingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken
     if(!incomingrefreshtoken){
      throw new ApiError(400,"unauthorized request")
     }

    try{
     const decodetoken =  jwt.verify(incomingrefreshtoken ,process.env.REFRESH_TOKEN_SECRET)
      const user = await User.findById(decodetoken?._id) 
      if(!user){
         throw new ApiError(401,"invalid Token")
      }

      if(incomingrefreshtoken !== user?.refreshToken){
        throw new ApiError(401,"refreshtoken is expired or used")
      }

      const{accessToken,newrefreshToken} =  await generateAccesstokenAndRefreshtoken(user._id)

      const options = {
        httpOnly:true,
        secure:true
      }

      res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrefreshToken,options)
      .json( new ApiResponse(
        200,
        {
          accessToken,refreshToken : newrefreshToken
        },
        "acccess token refreshed"
      ))
      }
      catch(error){
      throw new ApiError(401,error?.message || "invalid refreshtoken")
      }
  })
 const changepassword = asyncHandler( async (req,res)=>{
    const {oldpassword,newpassword,confpassword} = req.body
      const user = await User.findById(req.user?._id)
     const ispasswordcorrect = await user.passwordcorrect(oldpassword)
     if(!ispasswordcorrect){
       throw new ApiError(400,"invalid old password")
     }
      if(!(confpassword === newpassword)){
        throw new ApiError(400,"new and confirm password must be same")
      }
     user.password =newpassword 
     await user.save({validateBeforeSave:false})

     res
     .status(200)
     .json(new ApiResponse(
       200,
       {},
       "password changed successfully"
     ))

 }) 
 const getcurrentuser = asyncHandler(async (req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetch successfully")
 })

 const updateAccount = asyncHandler(async (req,res)=>{
      const {fullname,email}  = req.body

      if(!fullname || !email){
        throw new ApiError(401,"fulllname and userrname must be required")
      }
      
     const user =   User.findByIdAndUpdate(
        req.user?._id,
        { $set:{
          fullname:fullname,
          email:email
        }},
        {new : true}).select("-password")
       
        return res
        .status(200)
        .json(new ApiResponse(200,user,"fullname and email changed succesfully"))
 } )

 const updateAvatar = asyncHandler(async (req,res)=>{
   const avatarlocalpath = req.file?.path
   if(!avatarlocalpath){
    throw new ApiError(401,"avatar must required")
   }

   const avatar = await uploadoncloudinary(avatarlocalpath)

     if (!avatar?.url) {
    throw new ApiError(500, "Error uploading avatar");
  }

    const  user = await  User.findByIdAndUpdate(
    req.user?._id,
    { $set :{
      avatar : avatar.url
    }},
    {new :true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(
    200,
    user,
    "avatar upadated successfully"
   ))
 })

  const updatecoverImage = asyncHandler(async (req,res)=>{
   const coverImagelocalpath = req.file?.path
   if(!coverImagelocalpath){
    throw new ApiError(401,"coverImage must required")
   }

    const coverImage = await uploadoncloudinary(coverImagelocalpath)
     if (!coverImage?.url) {
    throw new ApiError(500, "Error uploading avatar");
  }

    const  user =  await User.findByIdAndUpdate(
    req.user?._id,
    { $set :{
      coverImage : coverImage.url
    }},
    {new :true}
   ).select("-password")
   
   return res
   .status(200)
   .json(new ApiResponse(
    200,
    user,
    "coverImage upadated successfully"
   ))
  })
export {registerUser,loginUser,logoutUser,refreshAccessToken,updateAccount,updateAvatar,updatecoverImage}