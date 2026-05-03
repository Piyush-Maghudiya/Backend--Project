import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema = mongoose.Schema({
    content:{
        type:String,
        required:true
    }, 
     owner:{
    type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }, 
    
},{timestamps:true})
tweetSchema.plugin(mongooseAggregatePaginate)
export const Tweet = mongoose.model("Tweet",tweetSchema)