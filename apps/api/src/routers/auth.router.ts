import express from "express";
import { authController } from "../controllers/auth.controller.ts";
import { protect } from "../middlewares/protect.middleware.ts";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/get-info", protect, authController.getInfo)

export default authRouter;
