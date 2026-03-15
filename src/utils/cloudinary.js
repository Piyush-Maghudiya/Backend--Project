import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRETE ,
})

   const uploadoncloudinary = async (localfilepath) =>{
      try{

        if(!localfilepath) return null //please upload file

          const response =  await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto"
        })
        // file uploaded successfully
        console.log("file upload successfully:" ,response.url);
         fs.unlinkSync(localfilepath);
        return  response

      }catch(error){
        // remove file from local temprory storage
        fs.unlinkSync(localfilepath);
        return null
      }
   }
   export default uploadoncloudinary