import { Router } from "express";
import{createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addvideotoPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylists
} from "../controllers/playlist.controller.js";
import {verifyjwt} from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyjwt);
router.route("/").post(createPlaylist);

router.route("/:playlistId").delete(deletePlaylist)
                           .patch(updatePlaylist)
                           .get(getPlaylistById);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/add/:videoId/:playlistId").patch(addvideotoPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);
export default router;