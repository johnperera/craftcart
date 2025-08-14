import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['BUYER', 'ARTISAN', 'ADMIN'], default: 'BUYER' },
  profileImage: String,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Virtuals for relationships
userSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'artisan'
});
userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'buyer'
});
userSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'user'
});


// Remove sensitive data when sending user object
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);
export default User;