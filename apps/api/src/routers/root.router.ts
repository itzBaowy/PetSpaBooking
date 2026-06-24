import express from "express";
import authRouter from "./auth.router.ts";
import userRouter from "./user.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);

export default rootRouter;
