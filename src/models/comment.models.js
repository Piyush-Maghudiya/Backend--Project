import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new mongoose.Schema({
   content: {
        type:String,
        required:ture
    },
    vedio:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
      type:mongoose.Schema.ObjectId,
       ref:"User"
    }
},{timestamps:true})
commentSchema.plugin(mongooseAggregatePaginate)
export const Comment =  mongoose.model("Comment",commentSchema)