import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {getVideoComment,addcomment,updatecomment,deletecomment} from  "../controllers/comment.controller.js";
import verifyjwt from "../middleware/auth.middleware.js";

const router = Router()

router.use(verifyjwt, upload.none()); // Apply verifyJWT middleware to all routes in this file
router.route("/:vedioid").get(getVideoComment);
router.route("/:vedioid").post(addcomment);
router.route("/:commentid").patch(updatecomment);
router.route("/:commentid").delete(deletecomment);

export default router
