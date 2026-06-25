import express from "express";
import { bankController } from "../controllers/bank.controller.ts";

const bankRouter = express.Router();

bankRouter.get("/", bankController.getBanks);

export default bankRouter;
