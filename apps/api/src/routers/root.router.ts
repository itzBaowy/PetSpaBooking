import express from "express";
import authRouter from "./auth.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);

export default rootRouter;
