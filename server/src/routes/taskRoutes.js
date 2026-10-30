import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createTaskValidator,
  updateTaskValidator,
} from '../validators/taskValidators.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

router.route('/')
  .post(createTaskValidator, createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTaskById)
  .patch(updateTaskValidator, updateTask)
  .delete(deleteTask);

export default router;
