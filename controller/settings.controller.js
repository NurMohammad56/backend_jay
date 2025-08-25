import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../errors/AppError.js";
import { User } from "../model/user.model.js";

// Get user settings
export const getSettings = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let user = await User.findById(userId).select("enableNotifications dnd");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User settings retrieved successfully",
    data: user,
  });
});

// Update user settings
export const updateSettings = catchAsync(async (req, res) => {
  const { enableNotifications, dnd } = req.body;
  const userId = req.user.id;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { enableNotifications, dnd },
    { new: true, runValidators: true }
  ).select("enableNotifications dnd");

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User settings updated successfully",
    data: updatedUser,
  });
});
