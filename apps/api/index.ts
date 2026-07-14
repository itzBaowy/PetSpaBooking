import express, { Request, Response, NextFunction } from "express";
import { createServer } from "node:http";
import rootRouter from "./src/routers/root.router.ts";
import { appErorr } from "./src/common/helpers/handle-error.helper.ts";
import dotenv from "dotenv";
import logger from "morgan";
import { NotFoundException } from "./src/common/helpers/exception.helper.ts";
import { swaggerOptions } from "./src/common/swagger/swagger.config.ts";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { startBookingAutoCompleteJob } from "./src/jobs/booking-auto-complete.job.ts";
import { startMomoPaymentSyncJob } from "./src/jobs/momo-payment-sync.job.ts";
import { socketService } from "./src/services/socket.service.ts";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

const allowedOrigins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://petlink.io.vn",
    "https://www.petlink.io.vn",
]);

app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }

    next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger UI
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)
);
app.use("/api", rootRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    throw new NotFoundException();
});

app.use(appErorr);

socketService.init(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

if (process.env.ENABLE_BOOKING_AUTO_COMPLETE_JOB === "true") {
    startBookingAutoCompleteJob();
} else {
    console.log("[booking-auto-complete] Disabled. Set ENABLE_BOOKING_AUTO_COMPLETE_JOB=true to enable.");
}

if (process.env.ENABLE_MOMO_PAYMENT_SYNC_JOB === "true") {
    startMomoPaymentSyncJob();
} else {
    console.log("[momo-payment-sync] Disabled. Set ENABLE_MOMO_PAYMENT_SYNC_JOB=true to enable.");
}

// Prevent Node from exiting cleanly
setInterval(() => {}, 1 << 30);

