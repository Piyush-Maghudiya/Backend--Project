import { Router } from "express";
import {toggleSubcription,
    getuserchhannelSubscriber,
    getsubscribedChannel
} from "../controllers/subscription.controller.js"

import {verifyjwt}  from "../middleware/auth.middleware.js"

const router = Router()
router.use(verifyjwt);
router.route("./c/:channelId").post(toggleSubcription)
                            .get(getuserchhannelSubscriber);
router.route("./u/:subscriberId").get(getsubscribedChannel)
export  default router