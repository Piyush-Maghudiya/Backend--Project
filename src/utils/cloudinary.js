import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloudname:process.env.CLOUDINARY_CLOUD_NAME,
    apikey:process.env.CLOUDINARY_API_KEY,
    apisecrete:process.env.CLOUDINARY_API_SECRETE ,
})

   const oncloudinaryupload = async (localfilepath) =>{
      try{

        if(!localfilepath) return null //please upload file

          const response =  await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto"
        })
        // file uploaded successfully
        console.log("file upload successfully:" ,response.url);
        return  response

      }catch(error){
        // remove file from local temprory storage
        fs.unlinkSync(localfilepath);
        return null
      }
   }