import { Router } from "express";
import {
  createItem,
  updateItemById,
  deleteItemById,
  displayDeletedAdvertisement,
  displayExpiredAdvertisement,
  analytics,
  displayAdvertisement,
  displayAdv,
  displayVentureAdv,
} from "../../controllers/fintConmtroller/adv.controller.js"; // ✅ Adjust path as needed
import { upload } from "../../middlewares/multer.middleware.js";
import { ventureVentureverifyJWT } from "../../middlewares/auth.venture.middleware.js";

const router = Router();

// fintVenture 
router.post("/add",ventureVentureverifyJWT, upload.single("img") , createItem);
router.patch("/:id",ventureVentureverifyJWT ,upload.single("img"), updateItemById); //❌
router.delete("/:id",ventureVentureverifyJWT , deleteItemById);
router.get("/",ventureVentureverifyJWT , displayAdv);
router.get("/single-venture/:id",ventureVentureverifyJWT , displayVentureAdv);

// =================
router.get("/available", displayAdvertisement);

router.get("/deleted" ,displayDeletedAdvertisement);

router.get("/expired", displayExpiredAdvertisement);


router.get("/analytics", analytics);


export default router;
