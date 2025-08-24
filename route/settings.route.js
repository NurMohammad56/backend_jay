import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controller/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", protect, getSettings);
router.patch("/", protect, updateSettings);

export default router;
