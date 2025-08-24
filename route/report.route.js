import express from "express";
import { createReport, getReports } from "../controller/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, getReports);

export default router;
