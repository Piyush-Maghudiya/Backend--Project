import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import {Like} from "../models/like.models.js";
import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.models.js";
import Comment from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
const togglevideolike = asyncHandler(async (req,res)=>{
      const {videoId }= req.params;
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is not valid")
     }

     const video = await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,"video is not found")
     }

     if(!req.user){
       throw new ApiError(400,"PLEASE LOGIN FOR LIKE VIDEO CONTENT")
     }

     const alreadylike = await Like.findOne(
        {
            video:videoId,
            likeBy:req.user?._id
        }
     ) 
     if(alreadylike){
        await Like.findByIdAndDelete(alreadylike?._id)

        return res
        .status(200)
        .json(new ApiResponse(200,"video unlike sucessfully"))
     }
     await Like.create({
        video:videoId,
        likeBy:req.user?._id
     })
     return res
     .status(200)
    .json(new ApiResponse(200,"video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
   
    if(!isValidObjectId(commentId)){
      throw new ApiError(400,"commentId is not valid")
    }
     const comment  = await Comment.findById(commentId)
     if(!comment){
      throw new ApiError(400,"comment is not found")
     }
     if (!req.user) {
  throw new ApiError(401, "Please login to like comment");
}

     const alreadylike = await Like.findOne({
      comment:commentId,
      likeBy:req.user?._id
     }) 
     if(alreadylike){
       await Like.findByIdAndDelete(alreadylike._id)

       return res
       .status(200)
       .json(new ApiResponse(200,"unliked comment successfully"))
     }

     await Like.create({
      comment:commentId,
      likeBy:req.user?._id
     })

     return res
     .status(200)
     .json(new ApiResponse(200,"comment liked sucessfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
   if(!isValidObjectId(tweetId)){
      throw new ApiError(400,"tweetId is not valid")
    }
     const tweet  = await Tweet.findById(tweetId)
     if(!tweet){
      throw new ApiError(400,"Tweet is not found")
     }
     if (!req.user) {
  throw new ApiError(401, "Please login to like comment");
}

     const alreadylike = await Like.findOne({
      tweet:tweetId,
      likeBy:req.user?._id
     }) 
     if(alreadylike){
       await Like.findByIdAndDelete(alreadylike._id)

       return res
       .status(200)
       .json(new ApiResponse(200,"unliked tweet successfully"))
     }

     await Like.create({
      tweet:tweetId,
      likeBy:req.user?._id
     })

     return res
     .status(200)
     .json(new ApiResponse(200,"tweet liked sucessfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
      const alllikedvideos = await Like.aggregate([
      {
         $match:{
            likeBy: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"likedvideo",
            pipeline:[
             {
               $lookup:{
                  from:"users",
                  localField:"owner",
                  foreignField:"_id",
                  as:"ownerdetail"
               },
             },
             { 
               // addfield + first ni jagiya ye unwind vaparay kem ke multiple video hasse
               // $addFields:{
               //    ownerdetail:{
               //       $first:"$ownerdetail"
               //    }
               // }
               $unwind:"$ownerdetail"
             }
          
            ]
         }
      },
    
      {
        $unwind:"$likedvideo"
      },
      {
         $project:{
            _id:0,
            likedvideo:{
               _id:1,
               "thumbnail.url":1,
               "video.url":1,
               owner:1,
               description:1,
               title:1,
               views:1,
               duration:1,
               createdAt:1,
                isPublished:1,
                ownerdetail:{
                      username:1,
                     "avatar.url":1,
                      fullname:1
                }
            }
         }
      }
   ]) 

   return res
   .status(200)
   .json(
      new ApiResponse(200,alllikedvideos,"liked video fetched successfully")
   )
})
export {togglevideolike,toggleCommentLike,toggleTweetLike,getLikedVideos}