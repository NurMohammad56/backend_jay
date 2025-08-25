import { Report } from "../model/report.model.js";
import { User } from "../model/user.model.js";
import sendResponse from "../utils/sendResponse.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../errors/AppError.js";

export const getUsers = catchAsync(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

  const users = await User.find({ role: { $ne: "admin" } })
    .select("-__v -password -refreshToken")
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: {
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("User ID is required", 400);
  }

  await User.findByIdAndDelete(id);
  await Report.deleteMany({ user: id });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
  });
});

export const getMonthlyStats = catchAsync(async (req, res) => {
  let { year = new Date().getFullYear(), type, month } = req.query;
  year = parseInt(year);
  month = month ? parseInt(month) : null;

  let match = {
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${year + 1}-01-01`),
    },
  };

  if (type) {
    match.category = type;
  }

  if (month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth =
      month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);

    match.createdAt.$gte = startOfMonth;
    match.createdAt.$lt = endOfMonth;
  }

  const stats = await Report.aggregate([
    { $match: match },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, category: "$category" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1, count: -1 } },
  ]);

  if (type || month) {
    const counts = {};
    stats.forEach((stat) => {
      const m = stat._id.month;
      if (!counts[m]) counts[m] = {};
      counts[m][stat._id.category] = stat.count;
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Monthly report counts retrieved successfully",
      data: counts,
    });
  }

  const highestPerMonth = {};
  stats.forEach((stat) => {
    const m = stat._id.month;
    if (!highestPerMonth[m] || stat.count > highestPerMonth[m].count) {
      highestPerMonth[m] = {
        category: stat._id.category,
        count: stat.count,
      };
    }
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Monthly report highest alert rates retrieved successfully",
    data: highestPerMonth,
  });
});
