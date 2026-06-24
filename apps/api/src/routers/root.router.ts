import express from "express";
import authRouter from "./auth.router.ts";
import userRouter from "./user.router.ts";
import providerRouter from "./provider.router.ts";
import serviceRouter from "./service.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/providers", providerRouter);
rootRouter.use("/services", serviceRouter);

export default rootRouter;
