import express, { Request, Response, NextFunction } from "express";
import rootRouter from "./src/routers/root.router.ts";
import { appErorr } from "./src/common/helpers/handle-error.helper.ts";
import dotenv from "dotenv";
import logger from "morgan";
import { NotFoundException } from "./src/common/helpers/exception.helper.ts";
import { swaggerOptions } from "./src/common/swagger/swagger.config.ts";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { startBookingAutoCompleteJob } from "./src/jobs/booking-auto-complete.job.ts";

dotenv.config();

const app = express();
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

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

startBookingAutoCompleteJob();

// Prevent Node from exiting cleanly
setInterval(() => {}, 1 << 30);

