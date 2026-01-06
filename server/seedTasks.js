import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/task.model.js';
import { connectDB } from './utils/db.utils.js';

dotenv.config();

// Sample tasks data
const sampleTasks = [
  {
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the task manager application',
    priority: 'high',
    status: 'completed',
    dueDate: new Date('2026-01-03'),
    completedAt: new Date('2026-01-03T10:30:00'),
    tags: ['documentation', 'important']
  },
  {
    title: 'Review Code Changes',
    description: 'Review pull requests and provide feedback',
    priority: 'high',
    status: 'completed',
    dueDate: new Date('2026-01-04'),
    completedAt: new Date('2026-01-04T14:20:00'),
    tags: ['code-review', 'development']
  },
  {
    title: 'Update Dependencies',
    description: 'Update npm packages to latest versions',
    priority: 'medium',
    status: 'completed',
    dueDate: new Date('2026-01-05'),
    completedAt: new Date('2026-01-05T09:15:00'),
    tags: ['maintenance', 'dependencies']
  },
  {
    title: 'Fix Authentication Bug',
    description: 'Resolve JWT token expiration issue',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date('2026-01-08'),
    tags: ['bug', 'security']
  },
  {
    title: 'Design New Dashboard',
    description: 'Create mockups for the new analytics dashboard',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date('2026-01-10'),
    tags: ['design', 'ui']
  },
  {
    title: 'Setup CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2026-01-12'),
    tags: ['devops', 'automation']
  },
  {
    title: 'Write Unit Tests',
    description: 'Add test coverage for analytics service',
    priority: 'low',
    status: 'pending',
    dueDate: new Date('2026-01-15'),
    tags: ['testing', 'quality']
  },
  {
    title: 'Optimize Database Queries',
    description: 'Improve performance of analytics aggregations',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2026-01-07'),
    tags: ['performance', 'database']
  },
  {
    title: 'Add Dark Mode Support',
    description: 'Implement dark theme throughout the application',
    priority: 'low',
    status: 'completed',
    dueDate: new Date('2026-01-02'),
    completedAt: new Date('2026-01-02T16:45:00'),
    tags: ['feature', 'ui']
  },
  {
    title: 'Security Audit',
    description: 'Perform security audit and fix vulnerabilities',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2026-01-20'),
    tags: ['security', 'audit']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🌱 Starting database seed...\n');

    // Get the admin/first user from database
    const User = mongoose.model('User');
    const users = await User.find();
    
    if (users.length === 0) {
      console.log('❌ No users found in database. Please register a user first!');
      process.exit(1);
    }

    const adminUser = users.find(u => u.role === 'admin') || users[0];
    console.log(`👤 Using user: ${adminUser.name || adminUser.email} (${adminUser.role})\n`);

    // Clear existing tasks (optional - comment out if you want to keep existing tasks)
    const deleteResult = await Task.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing tasks\n`);

    // Add assignedTo and createdBy to each task
    const tasksToInsert = sampleTasks.map(task => ({
      ...task,
      assignedTo: adminUser._id,
      createdBy: adminUser._id,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
    }));

    // Insert sample tasks
    const insertedTasks = await Task.insertMany(tasksToInsert);
    
    console.log(`✅ Successfully created ${insertedTasks.length} sample tasks!\n`);
    
    // Show summary
    const summary = {
      total: insertedTasks.length,
      completed: insertedTasks.filter(t => t.status === 'completed').length,
      inProgress: insertedTasks.filter(t => t.status === 'in-progress').length,
      pending: insertedTasks.filter(t => t.status === 'pending').length,
      high: insertedTasks.filter(t => t.priority === 'high').length,
      medium: insertedTasks.filter(t => t.priority === 'medium').length,
      low: insertedTasks.filter(t => t.priority === 'low').length,
    };
    
    console.log('📊 Tasks Summary:');
    console.log(`   Total: ${summary.total}`);
    console.log(`   Completed: ${summary.completed}`);
    console.log(`   In Progress: ${summary.inProgress}`);
    console.log(`   Pending: ${summary.pending}`);
    console.log(`   High Priority: ${summary.high}`);
    console.log(`   Medium Priority: ${summary.medium}`);
    console.log(`   Low Priority: ${summary.low}`);
    console.log('\n✨ Database seeding completed successfully!');
    console.log('🚀 Go to http://localhost:3000/analytics to see the data!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
