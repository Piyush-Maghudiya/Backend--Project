import { Router } from "express";
import {
       getchannelstats,
         getchannelvideos
} from "../controllers/dashboard.controller.js"

import verifyjwt from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyjwt);

router.route("/stats").get(getchannelstats);
router.route("/videos").get(getchannelvideos);

export default router