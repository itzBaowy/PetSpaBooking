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
import mobileBookingRouter from "./mobile-router/booking-mobile.router.ts";
import mobileNotificationRouter from "./mobile-router/notification-mobile.router.ts";
import adminDisputeRouter from "./admin-dispute.router.ts";
import adminDashboardRouter from "./admin-dashboard.router.ts";
import adminProviderRouter from "./admin-provider.router.ts";
import adminFinanceRouter from "./admin-finance.router.ts";
import adminBookingRouter from "./admin-booking.router.ts";
import adminWithdrawalRouter from "./admin-withdrawal.router.ts";
import adminUserRouter from "./admin-user.router.ts";
import adminAuditLogRouter from "./admin-audit-log.router.ts";
import adminReportRouter from "./admin-report.router.ts";
import adminNotificationRouter from "./admin-notification.router.ts";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/providers", providerRouter);
rootRouter.use("/services", serviceRouter);
rootRouter.use("/banks", bankRouter);
rootRouter.use("/admin", adminDashboardRouter);
rootRouter.use("/admin", adminProviderRouter);
rootRouter.use("/admin", adminDisputeRouter);
rootRouter.use("/admin", adminFinanceRouter);
rootRouter.use("/admin", adminBookingRouter);
rootRouter.use("/admin", adminWithdrawalRouter);
rootRouter.use("/admin", adminUserRouter);
rootRouter.use("/admin", adminAuditLogRouter);
rootRouter.use("/admin", adminReportRouter);
rootRouter.use("/admin", adminNotificationRouter);
rootRouter.use(
  "/mobile",
  providerRouterMobile,
  mobileServiceRouter,
  mobilePetRouter,
  mobileCustomerRouter,
  mobileBookingRouter,
  mobileNotificationRouter,
);

export default rootRouter;
