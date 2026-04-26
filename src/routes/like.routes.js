import { Router } from "express";
import {
    togglevideolike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos} from "../controllers/like.controller.js";

  import verifyjwt from "../middleware/auth.middleware.js";

  const router = Router();
  router.use(verifyjwt)

  router.route("/toggle/v:vedioId").post(togglevideolike);
  router.route("/toggle/v:commentId").post(toggleCommentLike);
  router.route("/toggle/v:tweetId").post(toggleTweetLike);
  router.route("/videos").get(getLikedVideos);

  export default router