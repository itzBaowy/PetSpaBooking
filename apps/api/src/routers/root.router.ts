import express from "express";
import authRouter from "./auth.router.ts";
import userRouter from "./user.router.ts";
import providerRouter from "./provider.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/providers", providerRouter);

export default rootRouter;
