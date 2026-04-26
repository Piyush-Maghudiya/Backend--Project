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
        // return  response modify like
        return {
          url:response.url,
          public_id:response.public_id
        }

      }catch(error){
        // remove file from local temprory storage
        fs.unlinkSync(localfilepath);
        return null
      }
   }


const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.log("No public_id provided");
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("File deleted successfully:", publicId);
      return result;
    } else if (result.result === "not found") {
      console.log("File not found on Cloudinary:", publicId);
      return null;
    } else {
      console.log("Unexpected response:", result);
      return null;
    }

  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export {deleteFromCloudinary,uploadoncloudinary} ;
