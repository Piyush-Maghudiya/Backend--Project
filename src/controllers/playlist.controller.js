import ApiErorr from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {Playlist} from "../models/playlist.models.js"
import mongoose,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!req.user?._id){
        throw new ApiErorr(400,"please login to create playlist")
    }

    if(!name || !description){
        throw new ApiErorr(400,"name and description is required")
    }
   
    const playlist  = await Playlist.create({
        name,
        description,
        owner:req.user?._id,
    });
   if(!playlist){
    throw new ApiErorr(500,"failed to create playlist please try againn")
   }
   return res
   .status(200)
   .json(new ApiResponse(200,playlist,"created playliist successfuly"))
})

const  updatePlaylist = asyncHandler(async (req,res)=>{
  const {name, description} = req.body;
  const {playlistId} = req.params;

  if(!req.user?._id){
    throw new ApiErorr(400,"please login to update playlist")
  }
  if(!name || !description){
    throw new ApiErorr(400,"name and description are required")
  }
  if(!isValidObjectId(playlistId)){
    throw new ApiErorr(400,"playlistId is not valid")
  }
  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiErorr(404,"playlist is not found")
  }

  if(req.user?._id.toString() !== playlist.owner.toString()){
    throw new ApiErorr(400,"only  owner update the playlist")
  }

  const updateplaylist = await Playlist.findByIdAndUpdate(playlistId,{
       $set:{
        name:name,
        description:description,
       }
  },{
    new :true,
  })

  if(!updateplaylist){
    throw new ApiErorr(500,"something went wrong , while update playlist")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,updateplaylist,"playlist update successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiErorr(400,"playListId is not valid")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiErorr(500,"playlist is not found")
    }

    if(req.user._id.toString() !== playlist.owner.toString()){
     throw new ApiErorr(400,"onnly admin can delete the playlist")
    }

    const deleteplaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deleteplaylist){
        throw new ApiErorr(400,"something went wrong  with deleting playliist ")
    }

    return res
      .status(200)
      .json(new ApiResponse(200,[],"deleting playlist successfully"))
})

const addvideotoPlaylist = asyncHandler(async (req,res)=>{
       const {playlistId, videoId} = req.params;

       if(!isValidObjectId(playlistId)){
        throw new ApiErorr(400,"playListId is not valid")
       }
       if(!isValidObjectId(videoId)){
        throw new ApiErorr(400,"videoId is not valid")
       }
       const playlistcheck = await Playlist.findById(playlistId);
       if(!playlistcheck){
        throw new ApiErorr(404,"PLAYLIST NOT FOUND")
       }
       const videocheck = await Video.findById(videoId);
       if(!videocheck){
        throw new ApiErorr(404,"video not found")
       }

       if(req.user?._id.toString() !== playlistcheck.owner.toString()){
        throw new ApiErorr(400,"only admin add video in playlist")
       }

       const addvideo = await Playlist.findByIdAndUpdate(
        playlistcheck?._id,
        {
        $addToSet:{
          videos:videoId,
        }
       },
      {
        new:true,
      })
       if(!addvideo){
        throw new ApiErorr(400,"video not add in playlist please try again")
       }

       return res
       .status(200)
       .json(new ApiResponse(200,addvideo,"video add playlist successful"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if(!isValidObjectId(playlistId)){
        throw new ApiErorr(400,"playListId is not valid")
       }
       if(!isValidObjectId(videoId)){
        throw new ApiErorr(400,"videoId is not valid")
       }
       const playlist = await Playlist.findById(playlistId);
       if(!playlist){
        throw new ApiErorr(404,"PLAYLIST NOT FOUND")
       }
       const video = await Video.findById(videoId);
       if(!video){
        throw new ApiErorr(404,"video not found")
       }

       if(req.user?._id.toString() !== playlist.owner.toString()){
        throw new ApiErorr(400,"only admin can  remove video in playlist")
       }
       const removevideo = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
         $pull:{
          videos:videoId,
         }
        },
        {
            new:true,
        }
       )
        return res
       .status(200)
       .json(new ApiResponse(200,removevideo,"video remove from playlist successful"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
      throw new ApiErorr(400,"userId is not valid")
    }

    const userplaylist = await Playlist.aggregate([
      {
        $match:{
          owner: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup:{
          from:"videos",
          localField:"videos",
          foreignField:"_id",
          as:"videos"
        }
      },
      {
        $addFields:{
          totalvideos:{
            $size:"$videos"
          },
          totalviews:{
            $sum:"$videos.views"
          }
        }
      },
      {
        $project:{
          _id:1,
          name:1,
          totalvideos:1,
          totalviews:1,
          description:1,
          updateAt:1,
        }
      }
    ])
    if(!userplaylist){
      throw new ApiErorr(400,"playlist videos not found")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,userplaylist," user playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
      throw new ApiErorr(400,"playliistId is not valid")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
      throw new ApiErorr(400,"playlist is not found")
    }

    const playlistaggregate = await Playlist.aggregate([
      {
        $match:{
          _id:new mongoose.Types.ObjectId(playlistId)
        }
      },
      {
        $lookup:{
          from:"videos",
          localField:"videos",
          foreignField:"_id",
          as:"videos"
        }
      },
      
        {
            $match: {
                "videos.isPublished": true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                totalvideos: {
                    $size: "$videos"
                },
                totalviews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
          $project:{
            name:1,
            description:1,
            totalvideos:1,
            totalviews:1,
            createdAt:1,
            updatedAt:1,
            owner:{
              _id:1,
              username:1,
              fullname:1,
              "avatar.url":1,
            },
            videos:{
              _id:1,
               title:1,
               "videoFile.url":1,
               "thumbnail.url":1,
               views:1,
               duration:1,
               description:1,
               createdAt:1,
            }
          }
        }
    ])
    if(!playlistaggregate.length ){
      throw new ApiErorr(400,"playlist not found")
    }
  return res
  .status(200)
  .json(new ApiResponse(200,playlistaggregate,"playlist fetched successfully"))
    
})
export {createPlaylist,updatePlaylist,deletePlaylist,addvideotoPlaylist,removeVideoFromPlaylist,getPlaylistById,getUserPlaylists}