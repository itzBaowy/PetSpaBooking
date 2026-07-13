import express from "express";
import { protect } from "../../middlewares/protect.middleware.ts";
import { saveDeviceToken } from "../../controllers/mobile-controllers/user-mobile.controller.ts";

const mobileUserRouter = express.Router();

mobileUserRouter.post("/users/device-token", protect, saveDeviceToken);

export default mobileUserRouter;
