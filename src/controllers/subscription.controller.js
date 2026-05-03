import { Subscription } from "../models/subscription.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose,{isValidObjectId} from "mongoose";

const toggleSubcription = asyncHandler(async (req,res)=>{
  const {channelId} = req.params;
 if(!isValidObjectId(channelId)){
    throw new ApiError(400,"channelId is not valid")
 }
  const alreadysubscribe  = await Subscription.findOne({
   subscriber:req.user?._id,
   channel:channelId,
  })
  if(alreadysubscribe){
     await Subscription.findByIdAndDelete(alreadysubscribe?._id)

     return res
        .status(200)
        .json(new ApiResponse(200,{subscribed:false}," channel unsbcribbed successfull"))
  }
   const subscribe = await Subscription.create({
        subscriber :req.user?._id,
        channel : channelId,
   })
    return res
            .status(200)
            .json(new ApiResponse(200,{subscribed:true},"chhanel subcribed successsfully"))
})

const getuserchhannelSubscriber = asyncHandler(async (req,res)=>{
     const {channelId} = req.params;
     if(!isValidObjectId(channelId)){
      throw new ApiError(400,"channelId is not valid")
     }
     const getallsubscriber = await Subscription.aggregate([
      {
        $match:{
         channel:new mongoose.Types.ObjectId(channelId)
        }
      },
      {
        $lookup:{
         from:"users",
         localField:"subscriber",
         foreignField:"_id",
         as:"subscriber",
         pipeline:[
          {
            $lookup:{
               from:"subscriptions",
               localField:"_id",
                foreignField:"channel",
                as:"subscribedtosubscriber"
            }
          },
          {
            $addFields:{
               subscribedtosubscriber:{
                  $cond:{
                   if:{$in:[new mongoose.Types.ObjectId(channelId),"$subscribedtosubscriber.subscriber"]},
                   then:true,
                   else:false,
                  }
               },
               subscribercount:{
                  $size:"$subscribedtosubscriber"
               }
            }
          },
         ]
        }
      },
      {
       $unwind:"$subscriber"
      },
      {
       $project:{
         _id:0,
         subscriber:{
           _id:1,
           username:1,
           fullname:1,
           "avatar.url":1,
           subscribercount:1,
          subscribedtosubscriber:1
         }
       }
      }
     ])

     return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                getallsubscriber,
                "subscribers fetched successfully"
            )
        );
})

const getsubscribedChannel = asyncHandler(async(req,res)=>{
  const {subscriberId} = req.params;
    if(!isValidObjectId(subscriberId)){
      throw new ApiError(400,"subscriberId is not valid")
    }
    const subsccribedTo = await Subscription.aggregate([
      {
       $match:{
         subscriber:new mongoose.Types.ObjectId(subscriberId)
       }
      },
      {
         $lookup:{
            from:"users",
            localField:"channel",
            foreignField:"_id",
            as:"subscribedto",
            pipeline:[
               {
                  $lookup:{
                     from:"videos",
                     localField:"_id",
                     foreignField:"owner",
                     as:"videos"
                  }
               },
               {
                  $addFields:{
                     latestVideo:{
                        $last:"$videos"
                     }
                  }
               },
               
            ]
         }
      },
      {
          $unwind:"$subscribedto"
      },
      {
         $project:{
         _id: 0,
                subscribedto: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1,
                    },

         }
      }
   }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,subsccribedTo,"subscribed channels fetched successfully"))
})
export {toggleSubcription,getuserchhannelSubscriber,getsubscribedChannel}