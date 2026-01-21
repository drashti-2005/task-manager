import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['manager', 'admin', 'employee'],
    default: 'user',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Account status for admin control
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active',
  },
  // Last login timestamp
  lastLogin: {
    type: Date,
  },
  // Failed login attempts counter (security)
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  // Account lockout until (after too many failed attempts)
  lockoutUntil: {
    type: Date,
  },
  // Last password change date
  lastPasswordChange: {
    type: Date,
  },
  // Profile image URL
  avatar: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
};

// Method to increment failed login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // Reset if lock has expired
  if (this.lockoutUntil && this.lockoutUntil < Date.now()) {
    return await this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockoutUntil: 1 },
    });
  }
  
  const updates = { $inc: { failedLoginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.failedLoginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockoutUntil: Date.now() + lockTime };
  }
  
  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { failedLoginAttempts: 0, lastLogin: new Date() },
    $unset: { lockoutUntil: 1 },
  });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
