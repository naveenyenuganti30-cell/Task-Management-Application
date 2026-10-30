import { body } from 'express-validator';
import { validate } from './authValidators.js';

export const createTaskValidator = validate([
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 140 })
    .withMessage('Task title cannot exceed 140 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 40 })
    .withMessage('Category cannot exceed 40 characters'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
]);

export const updateTaskValidator = validate([
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 140 })
    .withMessage('Task title cannot exceed 140 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('Status must be todo, in_progress, or completed'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 40 })
    .withMessage('Category cannot exceed 40 characters'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Due date must be a valid date'),
]);
