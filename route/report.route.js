import express from "express";
import {
  createReport,
  getReports,
  getReportCoordinates,
  getAlerts,
  getAlertById,
  markAlertAsRead,
} from "../controller/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, getReports);
router.get("/coordinates", protect, getReportCoordinates);
router.get("/alerts", protect, getAlerts);
router.get("/alerts/:id", protect, getAlertById);
router.patch("/alerts/:id/read", protect, markAlertAsRead);

export default router;
