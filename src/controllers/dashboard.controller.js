import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.models.js"
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

const getchannelstats = asyncHandler(async(req,res)=>{
      
    //   total subscriber

    const sunbscriber = await Subscription.aggregate([
        {
        $match:{
            channel:new mongoose.Types.ObjectId(req.user?._id)
        }
        },
        {
          $group:{
            _id:null,
            subscribers:{
                $addToSet:"$subscriber"
            }
          }
        },
        {
            $project:{
                totalsubscriber:{
                   $size:"$subscribers"
                }
            }
        }
    ])

    const video = await Video.aggregate([
        {
           $match:{
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
          $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"likevideos"
          }
        
        },
        {
            $addFields:{
                totallikes:{
                    $size:"$likevideos"
                },
                totalviews:{
                    $sum:"$views"
                },
                totalvideos:1,
            }
        },
        {
          $project:{
            totallikes:1,
            totalvideos:1,
            totalviews:1
          }  
        },
        {
            $group:{
                _id:null,
                totallikes:{
                  $sum:"$totallikes"
                },
                totalvideos:{
                    $sum:1
                },
                totalviews:{
                    $sum:"$totalviews"
                }
            }
        }
    ])


    const chhanelstats = {
        totalsubscriber : sunbscriber[0]?.totalsubscriber ?? 0,
        totallikes :video[0]?.totallikes ?? 0,
        totalvideos:video[0]?.totalvideos ?? 0,
        totalviews:video[0]?.totalviews ?? 0

    }

    return res
        .status(200)
        .json(new ApiResponse(200,chhanelstats,"channel stats fetched sucessfully"))
})

const getchannelvideos = asyncHandler(async (req,res) =>{
   const allvideo = await Video.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(req.user?._id)
        }
    },
    {
       $lookup:{
           from:"likes",
           localField:"_id",
           foreignField:"video",
           as:"likes"
       } 
    },
    {
        $addFields:{
         createdAt:{
          $dateToParts: { date: "$createdAt" }
         },
         likescount:{
           $size:"$likes"
         }
        }
    },
    {
     $project:{
        _id:1,
        "videoFile.url":1,
        "thumbnail.url":1,
         title:1,
         description:1,
         isPublished:1,
         createdAt:{
            year:1,
            month:1,
            day:1
         },
         likescount:1
    }
    }
   ])
   return res
        .status(200)
        .json(new ApiResponse(200,allvideo,"channel videos fetched sucessfully"))
})


export {getchannelstats,getchannelvideos}