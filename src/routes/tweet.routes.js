import { Router } from "express";
import {
    createtweet,
    updatetweet,
    getalltweet,
    deletetweet
} from "../controllers/tweet.controller.js"

import verifyjwt from "../middleware/auth.middleware.js"
const router = Router();
router.use(verifyjwt)
router.route("/").post(createtweet)
 router.route("/:tweetId").patch(updatetweet)
                         .delete(deletetweet);
                         
 router.route("/user/:userId").get(getalltweet);
                        
export default router
