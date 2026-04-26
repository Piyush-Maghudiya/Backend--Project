import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema({
    username :{
      type : String,
      required  : true,
      unique : true,
      trim :true,
      lowercase :true,
      index:true
    },
    email:{
      type : String,
      required  : true,
      unique : true,
      trim :true,
      lowercase:true,
      
    },
    fullname :{
      type : String,
      required  : true,
      trim :true,
      index:true
    },
    avatar:{
        type:{
            public_id:String,
            url:String,
        },
        required:true
    },
    coverImage:{
        type:{
            public_id:String,
            url:String,
        }
    },
    watchHistory: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required:true
    }],
    password :{
        type :String,
        required: [true,"Passsword is required"]
    },
    refreshToken :{
        type: String
    },

},{timestamps:true})

userSchema.pre("save",async function(){
  if(this.isModified("password")){
      this.password =  await bcrypt.hash(this.password, 10)
  }
})
userSchema.methods.passwordcorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccesstoken = function (){
        return jwt.sign(
        {
           _id : this._id,
           username : this.username,
           email: this.email,
           fullname:this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshtoken = function (){
        return jwt.sign(
        {
           _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model("User",userSchema);
export   default User