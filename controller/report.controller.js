import AppError from "../errors/AppError.js";
import { Report } from "../model/report.model.js";
import { User } from "../model/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import { io } from "./../server.js";

export const createReport = catchAsync(async (req, res) => {
  const { category, location, description } = req.body;
  const userId = req.user.id;

  if (
    !location ||
    !location.coordinates ||
    !Array.isArray(location.coordinates.coordinates) ||
    location.coordinates.coordinates.length !== 2
  ) {
    throw new AppError("Location coordinates are required", 400);
  }

  const report = new Report({
    userId,
    category,
    location,
    description,
  });
  await report.save();

  await User.findByIdAndUpdate(userId, {
    lastPost: new Date(),
    $inc: { totalPosts: 1 },
  });

  io.to("alerts").emit("newAlert", { ...report.toObject(), type: category });

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
    .populate("userId", "name");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reports retrieved successfully",
    data: reports,
  });
});
