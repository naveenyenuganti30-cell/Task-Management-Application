import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [140, 'Task title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority (low, medium, high)',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'completed'],
        message: '{VALUE} is not a valid status (todo, in_progress, completed)',
      },
      default: 'todo',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [40, 'Category cannot exceed 40 characters'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal user-scoped query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, priority: 1 });

// Automatically update completedAt when status changes to completed
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
