import express from "express";
import {
  getUsers,
  deleteUser,
  getMonthlyStats,
} from "../controller/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protect, getUsers);
router.delete("/users/:id", protect, deleteUser);
router.get("/stats/monthly", protect, getMonthlyStats);

export default router;
