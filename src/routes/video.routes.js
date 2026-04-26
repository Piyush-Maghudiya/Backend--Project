import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import verifyjwt from "../middleware/auth.middleware.js";
import { getallvideo,publishvideo,getvideoByid,updatevideo,deletevideo,togglepublishstatus } from "../controllers/video.controller.js";

const  router = Router()

router.route("/").get(getallvideo)
router.route("/").get(getvideoByid)
router.use(verifyjwt)

    router.route("/").post(upload.fields([
           {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            ]),
            publishvideo
)

router.route("/v/:videoId").delete(deletevideo)
                           .patch(upload.single("thumbnail"),updatevideo)
router.route("/toggle/publish/:videoId").patch(upload.single("thumbnail"),togglepublishstatus)
export default router