import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true
});

// Virtual field to populate products associated with this category
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category'
});

const Category = mongoose.model('Category', categorySchema);
export default Category;