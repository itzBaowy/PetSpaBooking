import express from "express";
import { protect } from "../../middlewares/protect.middleware.ts";
import {
  saveDeviceToken,
  removeDeviceToken,
} from "../../controllers/mobile-controllers/user-mobile.controller.ts";

const mobileUserRouter = express.Router();

mobileUserRouter.post("/users/device-token", protect, saveDeviceToken);
mobileUserRouter.delete("/users/device-token", protect, removeDeviceToken);

export default mobileUserRouter;
