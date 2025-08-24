import express from "express";

import authRoute from "../route/auth.route.js";
import userRoute from "../route/user.route.js";
import reportRoute from "../route/report.route.js";
import adminRoute from "../route/admin.route.js";
import settingRoute from "../route/settings.route.js";

const router = express.Router();

// Mounting the routes
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/report", reportRoute);
router.use("/admin", adminRoute);
router.use("/settings", settingRoute);

export default router;
