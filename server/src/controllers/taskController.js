import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

// Helper to log user activity
const logActivity = async (userId, taskId, action, taskTitle, details = '') => {
  try {
    await Activity.create({
      userId,
      taskId,
      action,
      taskTitle,
      details,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, category, dueDate } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'medium',
      status: status || 'todo',
      category: category || 'General',
      dueDate: dueDate || null,
      userId: req.user._id,
      completedAt: status === 'completed' ? new Date() : null,
    });

    await logActivity(
      req.user._id,
      task._id,
      'created',
      task.title,
      `Task created with ${task.priority} priority and status '${task.status}'`
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for logged in user (with search, filter, sort, pagination)
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      dueDateFilter,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    // Strict ownership filter: ONLY tasks for this user
    const filter = { userId: req.user._id };

    // Search query on title and description
    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Due date specific filter (overdue, today, this_week)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dueDateFilter === 'overdue') {
      filter.dueDate = { $lt: startOfToday };
      filter.status = { $ne: 'completed' };
    } else if (dueDateFilter === 'today') {
      filter.dueDate = { $gte: startOfToday, $lte: endOfToday };
    } else if (dueDateFilter === 'upcoming') {
      filter.dueDate = { $gt: endOfToday };
      filter.status = { $ne: 'completed' };
    }

    // Sorting
    const sortField = ['createdAt', 'dueDate', 'priority', 'title', 'updatedAt'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, totalTasks] = await Promise.all([
      Task.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      currentPage: pageNum,
      totalPages: Math.ceil(totalTasks / limitNum) || 1,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID (verifying ownership)
// @route   GET /api/tasks/:id
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task
// @route   PATCH /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    const { title, description, priority, status, category, dueDate } = req.body;
    const previousStatus = task.status;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    // Log status change or update activity
    if (status && status !== previousStatus) {
      await logActivity(
        req.user._id,
        task._id,
        'status_changed',
        task.title,
        `Status changed from '${previousStatus}' to '${status}'`
      );
    } else {
      await logActivity(
        req.user._id,
        task._id,
        'updated',
        task.title,
        'Task details updated'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    await logActivity(
      req.user._id,
      null,
      'deleted',
      task.title,
      'Task permanently removed'
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
