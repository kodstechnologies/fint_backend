import { Router } from "express";
import { notefication } from "../../controllers/notefication/notefication.controller.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";

const router = Router();


router.get("/fint-user", userverifyJWT, notefication.display_fint_user_Notefication);
// router.post("/fint-venture",userverifyJWT, );

export default router;
