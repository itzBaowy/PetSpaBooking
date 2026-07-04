import express from "express";
import authRouter from "./auth.router.ts";
import userRouter from "./user.router.ts";
import providerRouter from "./provider.router.ts";
import serviceRouter from "./service.router.ts";
import bankRouter from "./bank.router.ts";
import providerRouterMobile from "./mobile-router/provider-mobile.router.ts";
import mobileServiceRouter from "./mobile-router/service-mobile.router.ts";
import mobilePetRouter from "./mobile-router/pet-mobile.router.ts";
import mobileCustomerRouter from "./mobile-router/customer.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/providers", providerRouter);
rootRouter.use("/services", serviceRouter);
rootRouter.use("/banks", bankRouter);
rootRouter.use(
  "/mobile",
  providerRouterMobile,
  mobileServiceRouter,
  mobilePetRouter,
  mobileCustomerRouter,
);

export default rootRouter;
