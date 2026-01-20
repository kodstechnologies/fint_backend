import { Router } from "express";
import { notefication } from "../../controllers/notefication/notefication.controller.js";
import { userverifyJWT } from "../../middlewares/auth.user.middleware.js";
// import { noteficationFintVentures } from "../../controllers/notefication/fintVentureNotefication.controller.js";
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";

const router = Router();

// notefication  =================================
// router.post("/user/deviceToken", notefication.saveAndSubscribeToken);
// Send Notification
// router.post("/user/send-notification", notefication.sendCustomerNotification);

router.get("/fint-user", userverifyJWT, notefication.display_fint_user_Notification);
router.get("/fint-venture", ventureVentureverifyJWT, notefication.display_fint_venture_Notification);
// router.post("/fint-venture",userverifyJWT, );


// notefication  =================================
// router.post("/ventures/deviceToken", noteficationFintVentures.saveAndSubscribeTokenFintVentures);
// // Send Notification
// router.post("/ventures/send-notification", noteficationFintVentures.sendCustomerNotificationFintVentures);

// router.get("/fint-ventures", userverifyJWT, noteficationFintVentures.display_fint_user_NoteficationFintVentures);
// router.post("/fint-venture",userverifyJWT, );

export default router;
