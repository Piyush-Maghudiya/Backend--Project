import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose,{isValidObjectId} from "mongoose";
import {Video} from "../models/video.models.js"
import User from "../models/user.models.js";
const createtweet = asyncHandler(async (req,res)=>{

     const {content} = req.body;
     if(!content){
        throw new ApiError(400,"content is not found")
     }
    
  const tweet = await Tweet.create({
     content:content,
     owner:req.user?._id
  })
  if(!tweet){
    throw new ApiError(400,"something went wrong with creating tweet")
  }
   return res.
        status(200)
        .json(new ApiResponse(200,tweet,"tweet created successfully"))

})

const updatetweet = asyncHandler(async (req,res)=>{
      const{content} = req.body;
      const{tweetId} =  req.params;

      if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is not valid")
      }

      if(!content){
        throw new ApiError(400,"content is not found")
      }

      const  usertweet = await Tweet.findById(tweetId)
      if(!usertweet){
        throw new ApiError(400,"user tweet is not found!") 
      }

      if(req.user?._id.toString() !== usertweet.owner.toString()){
        throw new ApiError(403,"only tweet owner upddate the tweet")
      }
      const tweet = await Tweet.findByIdAndUpdate(usertweet?._id,{
         $set:{
            content:content,
         },  
       },
         {
          new :true
        })
      if(!tweet){
        throw new ApiError(400,"tweet not update somthing went wrong ,please try again")
      }
       return res
          .status(200)
          .json(new ApiResponse(200,tweet,"tweet updated sucessfully"))
})

const deletetweet  = asyncHandler(async (req,res)=>{
     const {tweetId} = req.params;
     if(!isValidObjectId(tweetId)){
      throw new ApiError(400,"tweetId is not valid")
     }

     const tweet = await Tweet.findById(tweetId)
     if(!tweet){
      throw new ApiError(400,"tweet is not found ")
     }

     if( req.user?._id.toString() !== tweet.owner.toString()){
      throw new ApiError(403,"only tweet owner delete the tweet")
     }

     const deletetweet =  await Tweet.findByIdAndDelete(tweet?._id) 
    if (!deletetweet) throw new ApiError(500, "Failed to delete tweet") 
     return res 
              .status(200)
              .json(new ApiResponse(200,{},"tweet deleted successfully"))
})

const getalltweet  = asyncHandler(async (req,res)=>{
     const{userId} = req.params;
    if(!isValidObjectId(userId)){
      throw new ApiError(400,"userId is not valid")
    }
      
    const tweetagregate = await Tweet.aggregate([
      {
        $match:{
                owner: new mongoose.Types.ObjectId(userId),
        }
      },
      {
         $lookup:{
             from:"users",
            localField:"owner",
             foreignField:"_id",
           as:"owner"
         }
      },
      {
         $lookup:{
             from:"likes",
            localField:"_id",
            foreignField:"tweet",
            as:"likes"
         }
      },
      {
         $addFields:{
            tweetlikescount:{
            $size:"$likes"
           },
           owner:{
            $first:"$owner"
           },
           istweetliked:{
            $cond:{
                if:{$in:[req.user?._id,"$likes.likeBy"]},
                then:true,
                else:false
            }
           }
         }
      },
      {
         $project:{
          tweetlikescount:1,
          content:1,
          istweetliked:1,
          owner:{
            username:1,
            fullname:1,
            "avatar.url":1, 
          }
         }
      },
       { $sort: { createdAt: -1 } }, 
    ])
 
    return res
            .status(200)
            .json(new ApiResponse(200,tweetagregate,"fetched all tweet successfully"))

})
export {createtweet,updatetweet,getalltweet,deletetweet}