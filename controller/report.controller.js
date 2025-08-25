import AppError from "../errors/AppError.js";
import { Alert } from "../model/alert.model.js";
import { Report } from "../model/report.model.js";
import { User } from "../model/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { io } from "./../server.js";

export const createReport = catchAsync(async (req, res) => {
  const { type, location, description, title } = req.body;
  const userId = req.user.id;

  if (
    !location ||
    location.type !== "Point" ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    throw new AppError(
      "Location must have type=Point and [lng, lat] coordinates",
      400
    );
  }

  const report = new Report({
    user: userId,
    title,
    type,
    location,
    description,
  });
  await report.save();

  await User.findByIdAndUpdate(userId, {
    lastPost: new Date(),
    $inc: { totalPosts: 1 },
  });

  const alert = new Alert({
    report: report._id,
    type,
    location: report.location,
  });
  await alert.save();

  io.to("alerts").emit("newAlert", { ...report.toObject(), type });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Report created successfully",
    data: report,
  });
});

export const getReports = catchAsync(async (req, res) => {
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate("user", "name avatar");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reports retrieved successfully",
    data: reports,
  });
});

export const getReportCoordinates = catchAsync(async (req, res) => {
  const reports = await Report.find()
    .select("location.coordinates type createdAt")
    .lean();

  const coordinatesData = reports.map((report) => ({
    coordinates: report.location.coordinates,
    type: report.type,
    timestamp: report.createdAt,
  }));

  if (coordinatesData.length === 0) {
    throw new AppError("No reports found", 404);
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Report coordinates retrieved successfully",
    data: coordinatesData,
  });
});

// Get alerts
export const getAlerts = catchAsync(async (req, res) => {
  const alerts = await Alert.find()
    .sort({ createdAt: -1 })
    .populate("report", "title description");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alerts retrieved successfully",
    data: alerts,
  });
});

// Get a single alert by ID
export const getAlertById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const alert = await Alert.findById(id).populate(
    "report",
    "title description"
  );

  if (!alert) {
    throw new AppError("Alert not found", 404);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alert retrieved successfully",
    data: alert,
  });
});

// Mark as read
export const markAlertAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const alert = await Alert.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!alert) {
    throw new AppError("Alert not found", 404);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Alert marked as read successfully",
    data: alert,
  });
});
