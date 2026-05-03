import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import User from "../models/user.models.js";
import {uploadoncloudinary,deleteFromCloudinary} from"../utils/cloudinary.js"
import mongoose,{isValidObjectId} from "mongoose";
// get all video
// get video,upload on cloudnairy,create video
// get video by id
// update video detail
// delete video 

const getallvideo = asyncHandler(async (req,res) => {
       const {page=1,limit=10,query,sortBy, sortType, userId}= req.query;
       
       if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"valid userId is required")
       }
       const user = await User.findById(userId)
       if(!user){
        throw new ApiError(400,"user not found")
       }

       const pipeline = [];
         if(query){
        pipeline.push({
            $search:{
                index:"search-index",
                text:{
                    query:query,
                    path:["title","description"]
                }
            }
        })
       }
       pipeline.push({
        $match:{
            owner: new mongoose.Types.ObjectId(userId)
        }
       })
     
    //   check published video
    pipeline.push({
        $match:{
            isPublished:true
        }
    })
    // sortby&sorttype
   if(sortBy&&sortType) {
        pipeline.push({
        $sort:{
             [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1
        }
        })
      }
       else{
        pipeline.push({ $sort: { createdAt: -1 } });
      }
//  i  after add this
   pipeline.push({
    $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"ownerdetail",
        pipeline:[{
            $project:{
              username:1,
              "avatar.url":1
            }
        }
        ]
    }
   }) 
       const allvideo = await Video.aggregate(pipeline)
       const options ={
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
       }
        const video = await Video.aggregatePaginate(
        allvideo,
        options
    );
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"all video fetchd successfully")
    )

})
const publishvideo  = asyncHandler(async (req,res) =>{
    const{title,description,duration} = req.body

    // Use the logged-in user from auth middleware (req.user) instead of req.params
    const userId = req.user._id;

    const videofilepath = req.files?.videoFile?.[0]?.path;
    const thumbnailfilepath = req.files?.thumbnail?.[0]?.path;

    if(!videofilepath){
    throw new ApiError(401,"video must required")
    }
    if(!thumbnailfilepath){
    throw new ApiError(401,"thumbnail must required")
    }
    if(!title || !description ||!duration){
    throw new ApiError(401,"Thumbnail,title,Description and Duration must required")
    }
    const videouploadonclodnairy = await  uploadoncloudinary(videofilepath)
    const thumbnailuploadonclodnairy = await  uploadoncloudinary(thumbnailfilepath)
     if(!videouploadonclodnairy){
    throw new ApiError(500,"somthing went wrong while uploading video on cloudnairy")
    }
    if(!thumbnailuploadonclodnairy){
    throw new ApiError(500,"somthing went wrong while uploading thumbnail on cloudnairy")
    }
    const uploadvideo = await Video.create({
        videoFile: videouploadonclodnairy.url,
        thumbnail: thumbnailuploadonclodnairy.url,
        title:title,
        description:description,
        duration:duration,
        owner:userId
    })
    if(!uploadvideo){
    throw new ApiError(500,"somthing went wrong while uploading video in database")
    }
    return res
     .status(200)
     .json(
        new ApiResponse(200,uploadvideo,"video published successfully")
     )
   
})
const getvideoByid = asyncHandler(async (req,res) =>{
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
}
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }
   const videoaggrigate  = await  Video.aggregate([
       {
        $match:{
                _id:new mongoose.Types.ObjectId(videoId)
              },
       },
       {
       $lookup:{
         from:"likes",
         localField:"_id",
         foreignField:"video",
         as:"likes"
          },
       },
       {
        $lookup:{
         from:"users",
         localField:"owner",
         foreignField:"_id",
         as:"owner",
         pipeline:[
           {
             $lookup:{
              from:"subscriptions",
              localField:"_id",
              foreignField:"channel",
              as:"subscribers"
            },
        },
        {
           $addFields:{
            subscribercount:{
                 $size:"$subscribers"
            },
            issubscribed :{
              $cond :{
            if:{$in:[ req.user?._id ,"$subscribers.subscriber"]},
            then:true,
            else:false
           }
            }
           },
        },
        {
           $project:{
             subscribercount:1,
             issubscribed:1,
             username:1,
             "avatar.url":1
           }
        }
         ]
        }
       },
       {
       $addFields:{
        likescount:{
            $size:"$likes"
        },
         isliked: {
             $cond:{
            if:{
                $in :[req.user?._id,"$likes.likeBy"]
            },
            then:true,
            else:false,
        }
        },
        owner:{
            $first:"$owner"
        }
        },
       },
       {
        $project:{
        videoFile:1,
          title:1,
          description:1,
          duration:1,
           isPublished:1,
           owner:1,
           views:1,
          isliked:1,
          likescount:1
       }
      }

   ])
     //    increases view
     await Video.findByIdAndUpdate(videoId,{
        $inc:{
            views:1
        }
     })
    //  add in wathch history
     await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{
            watchHistory: videoId,
        }
     })

     res
     .status(200)
     .json(new ApiResponse(200,
        videoaggrigate[0],
        "video detail fetched successfully"
     ))
   
})
const updatevideo = asyncHandler(async(req,res)=>{
  const { videoId } = req.params;
  const {title,description} =req.body;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"videoid not valid")
  }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not fouund")
    }
    // owner upadte the video
    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(400,"only  owner upade the video")
    }
   if(!title || !description){
    throw new ApiError(400,"title and description are required")
   }
    const thumbnailloaclpath = req.file?.path;
    if(!thumbnailloaclpath){
         throw new ApiError(400,"thumbnail is required")
    }
   
   const thumbnailplpath = await uploadoncloudinary(thumbnailloaclpath);
     if(!thumbnailplpath){
        throw new ApiError(500,"thumbnail upload failed")
     }
   const updatedvideo = await Video.findByIdAndUpdate(videoId,
    {
       $set:{
        thumbnail: thumbnailplpath.url,
        title:title,
        description:description,
       }
    },
    {new :true}
   )
   if(!updatedvideo){
    throw new ApiError(400,"Failed to update video please try  again")
   }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedvideo,"video updated successfull"))
})
const deletevideo = asyncHandler(async (req,res)=>{
   const { videoId } = req.params;
   if(!isValidObjectId(videoId)){
    throw new ApiError(400,"vedioid is not valid ")
   }
   const video =  await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"video not found")
    }
   if(req.user._id.toString() !== video.owner.toString()){
     throw new ApiError(400,"only owner delete the post")
   }
   const deletevideo = await Video.findByIdAndDelete(video?._id)

   if(!deletevideo){
    throw  new ApiError(500,"something went wrong when deleting video")
   }
   
  // Note: cloudinary cleanup skipped — videoFile and thumbnail are stored as plain URL strings
  // To enable cleanup, store public_id separately in the video model

  return res
  .status(200)
  .json(
    new ApiResponse(200,"video deleted successfully")
  )

})
const togglepublishstatus = asyncHandler(async (req,res)=>{
    const{videoId} = req.params;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoID is not valid");
    }
    const video =await  Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video is not found")
    }
    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(404,"only owner change tooggle publish status")
    }

    const togglepublish =  await Video.findByIdAndUpdate(videoId,
        {
            $set:{ isPublished: !video?.isPublished},
        },
        {new:true}
    )
     return res
     .status(200)
     .json(
        new ApiResponse(
            200,
            {isPublished: togglepublish.isPublished},
            "Video publish toggled successfully"
        )
     )
})
export {getallvideo,publishvideo,getvideoByid,updatevideo,deletevideo,togglepublishstatus}