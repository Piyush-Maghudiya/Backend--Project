import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Comment from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import User from "../models/user.models.js";
// work of this controller
// get all  vedio comment 
// write comment
// upadate comment
// delete comment

const getVideoComment = asyncHandler(async (req,res)=>{
    const{vedioid} = req.params
    const {page = 1, limit = 10} = req.query

     const video =  await Video.findById(vedioid)
    if(!video){
        throw new ApiError(400,"video is not found")
    }

    const  getallComment = Comment.aggregate([
       { 
        $match:{
            video:new mongoose.Types.ObjectId(vedioid)
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
        foreignField:"comment",
        as:"likes"
        }
        },
        {
        $addFields:{
           likescount:{
            $size:"$likes"
           },
           owner:{
            $first:"$owner"
           },
           isliked:{
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
        likescount:1,
        content:1,
        owner:{
            username:1,
            fullname:1,
            avatar:1
        },
        isliked:1
        }
       }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const comments = await Comment.aggregatePaginate(
        getallComment,
        options
    );

    return res.status(200)
    .json(
        new ApiResponse(200,comments,"comment fetched successfully")
    )
})

const addcomment = asyncHandler(async (req,res) =>{
      const{videoid} = req.params
      const {content} =  req.body || {}
      const video =  await Video.findById(videoid)
      if(!video){
        throw new ApiError(400,"video not found")
      }
      if(!content){
        throw new ApiError(400,"comment content is required")
      }
      const comment  = await Comment.create({
        content:content,
        video: videoid,
       owner: req.user._id
      })
      if(!comment){
        throw new ApiError(500," sothing went wrong while enter comment")
      }

      res
      .status(200)
      .json(
        new ApiResponse(200,comment,"add coomment successfully ")
      )
     

})
const updatecomment = asyncHandler(async (req,res) =>{
    const {commentid}  = req.params
  const comment  = await Comment.findById(commentid)

    if(!comment){
        throw new ApiError(400,"comment not founded")
    }
      const {content} = req.body
     if(!content){
        throw new ApiError(400,"content must required")
    } 
    if( req.user?._id.toString() !== comment.owner.toString()){
      throw new ApiError(400,"cannot edit another comment")
    }
    const updatecomment = await  Comment.findByIdAndUpdate(
        commentid,
        { 
         $set:{
           content:content
           }   
        },
        {
          new :true
        }
    )
    if(!updatecomment){
        throw new ApiError(500,"failed to edit comment please try again")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatecomment,"comment updated successfully")
    )
})
const deletecomment = asyncHandler(async (req,res)=>{
      const {commentid} = req.params
      const comment = await Comment.findById(commentid)
      if(!comment){
       throw new ApiError(400,"comment not founded")
      }

      if( req.user._id.toString() !== comment.owner.toString()){
        throw new ApiError(400," only comment owner delete the comment ")
      }

      const removecomment = await Comment.findByIdAndDelete(commentid)
     if (!removecomment) throw new ApiError(500, "Failed to delete comment") 
      return res
      .status(200)
      .json(new ApiResponse(200,{},"comment deleted successfully"))

})
export {getVideoComment,addcomment,updatecomment,deletecomment}