import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hashedPassword: { type: String, required: true, select: false },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date, default: null },
  badges: [{ type: String }],
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models?.User || mongoose.model('User', UserSchema);
export default User;
