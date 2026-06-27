import express from "express";
import authRouter from "./auth.router.ts";
import userRouter from "./user.router.ts";
import providerRouter from "./provider.router.ts";
import serviceRouter from "./service.router.ts";
import bankRouter from "./bank.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/providers", providerRouter);
rootRouter.use("/services", serviceRouter);
rootRouter.use("/banks", bankRouter);

export default rootRouter;
