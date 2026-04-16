import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const likeSchema = mongoose.Schema({
    likeBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
     video:{
    type:mongoose.Schema.Types.ObjectId,
      ref:"Video"
    }, 
     comment:{
    type:mongoose.Schema.Types.ObjectId,
      ref:"Comment"
    }, 
    tweet:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Tweet"  
    }
},{timestamps:true})
likeSchema.plugin(mongooseAggregatePaginate)
export const Like = mongoose.model("Like",likeSchema)