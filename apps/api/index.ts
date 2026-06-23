import express, { Request, Response, NextFunction } from "express";
import rootRouter from "./src/routers/root.router.ts";
import { appErorr } from "./src/common/helpers/handle-error.helper.ts";
import dotenv from "dotenv";
import logger from "morgan";
import { NotFoundException } from "./src/common/helpers/exception.helper.ts";
import { swaggerOptions } from "./src/common/swagger/swagger.config.ts";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
