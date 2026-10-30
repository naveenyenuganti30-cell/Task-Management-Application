import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

// @desc    Get dashboard statistics for authenticated user
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Aggregations scoped strictly to the current user
    const [statsResult, overdueCount, priorityStats, categoryStats] = await Promise.all([
      // Status breakdown
      Task.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Overdue tasks: dueDate < start of today AND status != completed
      Task.countDocuments({
        userId,
        dueDate: { $lt: startOfToday, $ne: null },
        status: { $ne: 'completed' },
      }),

      // Priority breakdown
      Task.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),

      // Category breakdown
      Task.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    let total = 0;
    let todo = 0;
    let inProgress = 0;
    let completed = 0;

    statsResult.forEach((item) => {
      total += item.count;
      if (item._id === 'todo') todo = item.count;
      else if (item._id === 'in_progress') inProgress = item.count;
      else if (item._id === 'completed') completed = item.count;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorities = {
      low: 0,
      medium: 0,
      high: 0,
    };
    priorityStats.forEach((p) => {
      if (p._id && priorities[p._id] !== undefined) {
        priorities[p._id] = p.count;
      }
    });

    const categories = categoryStats.map((c) => ({
      name: c._id || 'General',
      count: c.count,
    }));

    res.status(200).json({
      success: true,
      stats: {
        total,
        todo,
        inProgress,
        completed,
        overdue: overdueCount,
        completionRate,
        priorities,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming tasks with deadlines in next 7 days
// @route   GET /api/dashboard/upcoming
export const getUpcomingTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = await Task.find({
      userId,
      dueDate: { $gte: startOfToday, $lte: sevenDaysFromNow },
      status: { $ne: 'completed' },
    })
      .sort({ dueDate: 1, priority: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      tasks: upcomingTasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent user activity
// @route   GET /api/dashboard/activity
export const getRecentActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
